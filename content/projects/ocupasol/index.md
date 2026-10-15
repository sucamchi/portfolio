# OcupaSol

A hotel occupancy forecaster for the Costa del Sol, built as a team of three. [Source on GitHub](https://github.com/sucamchi/OcupaSol)

`Python` `JavaScript` `ridge regression` `backtesting` `open data`

## The problem

Hotel occupancy on the Costa del Sol is highly seasonal, from around 45% in winter to over 80% in August, and it shifts from year to year. Many hotels still plan staff, prices and campaigns by gut feeling or by copying last year. OcupaSol predicts occupancy for the next 12 months, per town, and turns that into concrete numbers: expected occupied beds, suggested staffing and pricing advice.

## My part: data and model

- **Dataset.** A Python script (standard library only) pulls official monthly figures from the public INE API, Spain's national statistics office, and builds a clean dataset: **2,035 monthly records** from 1999 to 2026 for the Costa del Sol and seven towns, with 14 variables each. Gaps such as the COVID closures of 2020 are kept as gaps rather than invented.
- **Model.** Occupancy in a month looks a lot like the same month last year. The model learns how to correct that guess from recent year-on-year trends, using ridge regression solved directly in the browser in plain JavaScript, with no ML libraries. One model is trained per town, with the COVID months left out.
- **Validation.** The model is backtested on the last 3 years (36 months it never saw) and compared against the simplest possible baseline, "same as last year". The app shows the real error and a 90% confidence interval instead of a single, overconfident number.

## The app

A single HTML page that runs without a server: a dashboard with historical trends, a comparison between towns, a seasonality map, and a form where a hotel enters its town, month and size to get its forecast. My teammates built the interface and led testing and documentation.
