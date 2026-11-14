# NASA Space Apps 2026 Submission Kit

## Project

**Project title:** FieldShift — Farm rotation planner  
**Team:** NASA Knights  
**Challenge:** Field Shift: Adapting Farms with NASA Data  
**Local event:** Jaffna, Sri Lanka

## Project summary

FieldShift helps farmers and agricultural extension workers compare crop-rotation ideas using NASA climate history, field notes, and farmer priorities. It analyzes ten complete years of NASA POWER monthly temperature and rainfall at a selected coordinate, plots each completed Yala or Maha season so users can inspect variability, and ranks transparent rotation concepts by water access, soil texture, and the farmer’s chosen goal. A NASA GPM IMERG rainfall estimate is shown separately as an independent cross-check when available. The farmer can download a portable field decision card to support an extension conversation. FieldShift is a planning prototype, not a yield forecast or substitute for local agricultural advice.

## Detailed description

Farmers often have to weigh water availability, soil conditions, crop sequence, and household priorities at the same time. FieldShift turns those inputs into a comparison that can be discussed with a farmer or extension worker. A user enters a field coordinate and approximate soil notes, records the current main crop and water access, chooses Yala or Maha, and selects whether water conservation, soil building, or income options matter most.

The app requests monthly `T2M` and `PRECTOTCORR` from NASA POWER’s Agroclimatology point API for the previous ten complete years. It converts monthly mean precipitation from mm/day into monthly totals, then calculates Yala and Maha seasonal totals. A year-by-year rainfall chart shows the selected season’s history; seasons below 75% of that season’s median are highlighted. The selected priority, soil texture, water access, and frequency of drier seasons change the order of three rotation concepts. Each result shows its crop sequence, a rule score, the NASA climate signal, and the main caveat. A one-click field card carries the entered context and ranked ideas into a printable, shareable conversation aid.

When the independent data request is available, the app also retrieves NASA POWER’s Hydrology community `IMERG_PRECTOT` series, which is based on NASA GPM IMERG precipitation. It compares matched seasonal averages with the Agroclimatology series and displays the difference without combining the products. If NASA data cannot be reached, the app labels its illustrative values as sample data.

The current prototype uses Jaffna as its starting location, but accepts other coordinates. The rotation list and 1–5 trait values are illustrative assumptions that still need review by local farmers and agronomists. No claim is made about predicted yield, profitability, future weather, or measured soil quality.

## NASA data resources

1. **NASA POWER Monthly Point API — Agroclimatology**  
   URL pattern: `https://power.larc.nasa.gov/api/temporal/monthly/point`  
   Parameters used: `T2M`, `PRECTOTCORR`; community `AG`; user-selected latitude/longitude; previous ten complete years.  
   Documentation: https://power.larc.nasa.gov/docs/services/api/temporal/monthly/

2. **NASA POWER Monthly Point API — GPM IMERG rainfall cross-check**  
   URL pattern: `https://power.larc.nasa.gov/api/temporal/monthly/point`  
   Parameter used: `IMERG_PRECTOT`; community `AG`; same coordinates and period when available.  
   NASA references: https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/ and https://gpm.nasa.gov/data/imerg

3. **Local season framing**  
   Sri Lanka Department of Agriculture rice-season reference: https://doa.gov.lk/wp-content/uploads/2020/05/Rice-Congress-2010.pdf

## 30-second demo video script

“Farm decisions depend on more than the weather, so FieldShift brings field notes and farmer priorities together with NASA climate history. The year-by-year rainfall chart shows how Yala or Maha varied at the farm coordinates, with NASA GPM rainfall shown separately as a cross-check. Change water access or soil texture and the rotation ideas re-rank with reasons you can inspect. Download the field card to take those ideas into an extension conversation. It’s a planning aid, not a yield forecast.”

### Screen recording plan

1. Start on the Jaffna dashboard with the NASA POWER source label visible.
2. Scroll to the rotation planner, change water access or top priority, and show the alternatives reorder.
3. Select Maha and show the highlighted year-by-year rainfall variation beside the GPM cross-check.
4. Download the field decision card, then end on the open “How FieldShift uses NASA data” explanation.

Keep the submitted video at or under 30 seconds, or make a deck of no more than seven slides. Test the public link in a private browser window before submission.

## AI disclosure for the project page

OpenAI Codex assisted with software code, research, draft scoring logic and crop-trait assumptions, and project-description text. The team reviewed and edited the implementation. NASA data is fetched from NASA POWER and was not generated or modified by AI. No AI-generated images, videos, audio, NASA logos, flags, or mission identifiers are included.

## Judging fit

- **Impact:** Focuses on seasonal farm decisions and local farmer/extension conversations.
- **Creativity:** Makes NASA seasonal variability visible year by year, keeps the second rainfall product separate, and exports a farmer-ready decision card from the same explainable workflow.
- **Validity:** Shows data sources and units, keeps NASA products distinct, labels the threshold and prototype assumptions, and avoids unsupported yield forecasts.
- **Relevance:** Directly addresses rotation strategies, soil health, water constraints, NASA Earth-data context, and farmer priorities in the selected challenge.
- **Presentation:** Provides a short live walkthrough, plain-language result explanations, and a clear limitation statement.

## Final submission checklist

- **Hosting status:** the current app preview is private and requires owner access. Make the submitted demo link public and verify it in a private browser window before entering it on the official Project page.
- Add every registered NASA Knights member and role to the official team/project page.
- Paste the final public app URL and public source-code URL after publication.
- Add the challenge name, project summary, detailed description, NASA data references, and the AI disclosure above.
- Upload the demo video or attach a deck of up to seven slides; check it opens without a password.
- Submit the project on the official team Project page by **11:59 p.m. local time on November 15, 2026**.
- Confirm the selected NASA POWER dataset appears in the challenge’s Resources list and cite that challenge-provided resource in the official NASA submission fields.

The official Space Apps site says project submission opens on November 14 at 9:00 a.m. and closes on November 15 at 11:59 p.m. local time. Do the final submission through the team Project page; this local folder is not the official submission.
