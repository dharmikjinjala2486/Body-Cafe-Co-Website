# Visual theme feedback

Open `/feedback` on the local Python preview. The page is independent of the eight storefront themes. It uses the original logo paths (a separate SVG copy trims only the empty artboard) and existing optimized bottle mockups.

One **Open website preview** link points to https://body-cafe-co-website.netlify.app/?design=a. Reviewers use the A–H tabs already on that website. The form does not create eight preview tabs.

The survey asks for an overall favourite (including “none”), a runner-up, packaging fit, up to three reasons, up to three impressions, the reason behind the choice, improvements, and a least suitable theme with explanation. The required name field appears first in the survey. Names are validated in the browser and local API. The page uses a desktop-first layout and retains responsive mobile support. Text/content, pricing, and unfinished information are explicitly excluded from the review.

## Local responses

The local server saves validated responses to its `theme_feedback` SQLite table. Requests use the existing same-origin and CSRF protections. Response IDs prevent duplicate inserts on retry. No responses are publicly exposed. The preview labels local saving clearly.

The refreshed experience includes a sticky three-step journey, a gift note encouraging thoughtful and honest feedback, conversational questions, a live favourite/runner-up/packaging-fit recap, a required-answer completion indicator, and a personalised thank-you. The eight theme choices keep identical styling to avoid favouring a direction. Existing submitted field names and the Netlify form name are preserved.

Export from the repository root:

```sh
python3 design-tools/export_theme_feedback.py
```

Use `--db /path/to/database.sqlite3 --output /path/to/feedback.csv` for another preview database. The default output is `.local/theme-feedback.csv`, excluded from Git and the deployment.

## Netlify responses

The existing build exports `/feedback/index.html` with a static `bcc-theme-feedback` form, every submitted field, a honeypot, and survey version. Once deployed, enable **form detection** in Netlify and redeploy if necessary. Responses then appear in **Netlify → Forms → bcc-theme-feedback**, where they can be exported. Reference: [Netlify Forms setup](https://docs.netlify.com/manage/forms/setup/).

The frontend refuses hosted submission when Netlify has not processed the form. Failed requests retain the answers and show an error. Public form: https://body-cafe-co-website.netlify.app/feedback/. Form detection is enabled on the existing Netlify project. Verified submissions and CSV export are available at https://app.netlify.com/projects/body-cafe-co-website/forms/6adaff9db63fcaafd33d5890. The initial release was verified with a clearly labelled deployment test response.

## Verification

```sh
python3 -B -m unittest app.test_theme_feedback app.test_server app.test_http
node --check web/feedback.js
python3 -B deploy/build_netlify.py
node deploy/test_hosted_preview.mjs
```
