"""Review-photo sanitising for the local preview. Standard library only.

Accepts still JPEG, PNG and WebP images, identified by their bytes rather than the declared type or file name.
Removes metadata that can identify a person or place (EXIF including GPS, XMP, IPTC, comments, text chunks) and
keeps only what is needed to display the picture. A JPEG's EXIF orientation is carried over as a minimal EXIF block
holding nothing but that one tag, so phone photos still display the right way up. Animated images are refused.
"""
import struct

MAX_BYTES = 5 * 1024 * 1024
MAX_SIDE = 10000
TYPES = {'jpeg': ('image/jpeg', '.jpg'), 'png': ('image/png', '.png'), 'webp': ('image/webp', '.webp')}


class MediaError(ValueError):
    pass


def sniff(data):
    if data[:3] == b'\xff\xd8\xff':
        return 'jpeg'
    if data[:8] == b'\x89PNG\r\n\x1a\n':
        return 'png'
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return 'webp'
    return None


def _check_size(w, h):
    if not (0 < w <= MAX_SIDE and 0 < h <= MAX_SIDE):
        raise MediaError('The image dimensions are not supported.')
    return w, h


def _exif_orientation(payload):
    """Read tag 0x0112 from IFD0 of an APP1 'Exif' payload. Returns 1–8, or None."""
    if payload[:6] != b'Exif\x00\x00':
        return None
    t = payload[6:]
    if len(t) < 8:
        return None
    end = {b'II': '<', b'MM': '>'}.get(t[:2])
    if not end:
        return None
    try:
        off = struct.unpack(end + 'I', t[4:8])[0]
        count = struct.unpack(end + 'H', t[off:off + 2])[0]
        for i in range(min(count, 512)):
            e = t[off + 2 + 12 * i: off + 14 + 12 * i]
            tag, typ, _n = struct.unpack(end + 'HHI', e[:8])
            if tag == 0x0112 and typ == 3:
                v = struct.unpack(end + 'H', e[8:10])[0]
                return v if 1 <= v <= 8 else None
    except (struct.error, IndexError):
        return None
    return None


def _orientation_app1(v):
    """A minimal big-endian EXIF block containing only the Orientation tag."""
    tiff = b'MM\x00\x2a' + struct.pack('>I', 8) + struct.pack('>H', 1) + struct.pack('>HHIHH', 0x0112, 3, 1, v, 0) + struct.pack('>I', 0)
    body = b'Exif\x00\x00' + tiff
    return b'\xff\xe1' + struct.pack('>H', len(body) + 2) + body


def clean_jpeg(data):
    out = bytearray(b'\xff\xd8')
    i, w, h, orient = 2, None, None, None
    n = len(data)
    while i < n:
        if data[i] != 0xFF:
            raise MediaError('The JPEG file is damaged.')
        while i < n and data[i] == 0xFF:
            i += 1
        if i >= n:
            raise MediaError('The JPEG file is damaged.')
        marker = data[i]
        i += 1
        if marker == 0xD9:  # end of image before scan data
            raise MediaError('The JPEG file has no image data.')
        if 0xD0 <= marker <= 0xD7 or marker == 0x01:
            continue
        if i + 2 > n:
            raise MediaError('The JPEG file is damaged.')
        seg_len = struct.unpack('>H', data[i:i + 2])[0]
        if seg_len < 2 or i + seg_len > n:
            raise MediaError('The JPEG file is damaged.')
        seg = data[i + 2:i + seg_len]
        if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF) and len(seg) >= 5:
            h, w = struct.unpack('>HH', seg[1:5])
        if marker == 0xE1 and orient is None:
            orient = _exif_orientation(bytes(seg))
        keep = not ((0xE1 <= marker <= 0xEF and marker != 0xEE) or marker == 0xFE)  # drop APPn (EXIF, XMP, IPTC, ICC…) and comments; keep Adobe APP14 colour data
        if marker == 0xE0 and not seg.startswith(b'JFIF\x00'):
            keep = False  # JFXX and other APP0 payloads can carry thumbnails
        if keep:
            out += bytes([0xFF, marker]) + data[i:i + seg_len]
        i += seg_len
        if marker == 0xDA:  # start of scan: the rest is image data up to and including EOI
            out += data[i:]
            break
    else:
        raise MediaError('The JPEG file has no image data.')
    if w is None:
        raise MediaError('The JPEG file has no readable size.')
    _check_size(w, h)
    if orient and orient != 1:
        out[2:2] = _orientation_app1(orient)
    return bytes(out), w, h


PNG_KEEP = {b'IHDR', b'PLTE', b'IDAT', b'IEND', b'tRNS', b'gAMA', b'cHRM', b'sRGB', b'sBIT', b'pHYs', b'bKGD'}


def clean_png(data):
    out = bytearray(data[:8])
    i, w, h, saw_end = 8, None, None, False
    while i + 8 <= len(data):
        length = struct.unpack('>I', data[i:i + 4])[0]
        ctype = data[i + 4:i + 8]
        total = 12 + length
        if i + total > len(data):
            raise MediaError('The PNG file is damaged.')
        if ctype in (b'acTL', b'fcTL', b'fdAT'):
            raise MediaError('Animated images are not supported.')
        if ctype == b'IHDR':
            w, h = struct.unpack('>II', data[i + 8:i + 16])
        if ctype in PNG_KEEP:
            out += data[i:i + total]
        i += total
        if ctype == b'IEND':
            saw_end = True
            break
    if w is None or not saw_end:
        raise MediaError('The PNG file is damaged.')
    _check_size(w, h)
    return bytes(out), w, h


def clean_webp(data):
    size = struct.unpack('<I', data[4:8])[0]
    if size + 8 > len(data) or size < 12:
        raise MediaError('The WebP file is damaged.')
    i, chunks, w, h = 12, [], None, None
    while i + 8 <= 8 + size:
        fourcc = data[i:i + 4]
        length = struct.unpack('<I', data[i + 4:i + 8])[0]
        body = data[i + 8:i + 8 + length]
        if len(body) != length:
            raise MediaError('The WebP file is damaged.')
        padded = length + (length & 1)
        if fourcc in (b'ANIM', b'ANMF'):
            raise MediaError('Animated images are not supported.')
        if fourcc == b'VP8X' and length >= 10:
            body = bytes([body[0] & ~0x0C & ~0x02]) + body[1:]  # clear EXIF, XMP and animation flags
            w = 1 + int.from_bytes(body[4:7], 'little')
            h = 1 + int.from_bytes(body[7:10], 'little')
        elif fourcc == b'VP8 ' and length >= 10 and w is None:
            if body[3:6] != b'\x9d\x01\x2a':
                raise MediaError('The WebP file is damaged.')
            w = struct.unpack('<H', body[6:8])[0] & 0x3FFF
            h = struct.unpack('<H', body[8:10])[0] & 0x3FFF
        elif fourcc == b'VP8L' and length >= 5 and w is None:
            if body[0] != 0x2F:
                raise MediaError('The WebP file is damaged.')
            bits = int.from_bytes(body[1:5], 'little')
            w, h = (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
        if fourcc not in (b'EXIF', b'XMP '):
            chunks.append(fourcc + struct.pack('<I', len(body)) + body + (b'\x00' if len(body) & 1 else b''))
        i += 8 + padded
    if w is None:
        raise MediaError('The WebP file has no readable size.')
    _check_size(w, h)
    payload = b'WEBP' + b''.join(chunks)
    return b'RIFF' + struct.pack('<I', len(payload)) + payload, w, h


def sanitise(data):
    """Return (kind, mime, extension, cleaned_bytes, width, height) or raise MediaError."""
    if not data:
        raise MediaError('Choose an image to upload.')
    if len(data) > MAX_BYTES:
        raise MediaError('Each photo must be 5 MB or smaller.')
    kind = sniff(data)
    if not kind:
        raise MediaError('Upload a JPEG, PNG or WebP photo.')
    try:
        cleaned, w, h = {'jpeg': clean_jpeg, 'png': clean_png, 'webp': clean_webp}[kind](data)
    except (struct.error, IndexError):
        raise MediaError('The image file is damaged.')
    mime, ext = TYPES[kind]
    return kind, mime, ext, cleaned, w, h
