/**
 * Limitations periods that federal courts borrow for Section 1983 claims,
 * by state. Under Wilson v. Garcia, 471 U.S. 261 (1985), and Owens v. Okure,
 * 488 U.S. 235 (1989), the borrowed period is the state's general or residual
 * personal-injury statute of limitations.
 *
 * `confidence: "verify"` marks states where the legislature recently changed
 * the general personal-injury period or recodified the statute, so the
 * applicable period can depend on the incident date. Every page built from
 * this file tells the reader to confirm the statute before relying on it.
 */

export interface StateLimitations {
  slug: string;
  name: string;
  years: number;
  statute: string;
  confidence: "settled" | "verify";
  note?: string;
  /** Where the statute text was read when this entry was compiled. */
  source?: string;
}

export const SOL_LAST_REVIEWED = "2026-09-06";

export const STATE_LIMITATIONS: StateLimitations[] = [
  {
    slug: "alabama",
    name: "Alabama",
    years: 2,
    statute: "Ala. Code § 6-2-38(l)",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/al/title-6-civil-practice/al-code-sect-6-2-38/",
  },
  {
    slug: "alaska",
    name: "Alaska",
    years: 2,
    statute: "Alaska Stat. § 09.10.070(a)",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/ak/title-9-code-of-civil-procedure/ak-st-sect-09-10-070/",
  },
  {
    slug: "arizona",
    name: "Arizona",
    years: 2,
    statute: "Ariz. Rev. Stat. § 12-542",
    confidence: "settled",
    source: "https://www.azleg.gov/ars/12/00542.htm",
  },
  {
    slug: "arkansas",
    name: "Arkansas",
    years: 3,
    statute: "Ark. Code Ann. § 16-56-105",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/ar/title-16-practice-procedure-and-courts/ar-code-sect-16-56-105/",
    note: "The text of § 16-56-105 lists contract, trespass, libel, and property claims rather than personal injury by name. The Eighth Circuit treats it as Arkansas's general three-year period and borrows it for Section 1983 claims.",
  },
  {
    slug: "california",
    name: "California",
    years: 2,
    statute: "Cal. Civ. Proc. Code § 335.1",
    confidence: "settled",
    source:
      "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CCP&sectionNum=335.1",
  },
  {
    slug: "colorado",
    name: "Colorado",
    years: 2,
    statute: "Colo. Rev. Stat. § 13-80-102(1)",
    confidence: "verify",
    source:
      "https://codes.findlaw.com/co/title-13-courts-and-court-procedure/co-rev-st-sect-13-80-102/",
    note: "Federal courts in Colorado apply the two-year residual period in § 13-80-102 to Section 1983 claims. Colorado's separate state civil-rights statute (C.R.S. § 13-21-131) has its own limitations rules and is not a Section 1983 claim.",
  },
  {
    slug: "connecticut",
    name: "Connecticut",
    years: 3,
    statute: "Conn. Gen. Stat. § 52-577",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/ct/title-52-civil-actions/ct-gen-st-sect-52-577/",
  },
  {
    slug: "delaware",
    name: "Delaware",
    years: 2,
    statute: "Del. Code Ann. tit. 10, § 8119",
    confidence: "settled",
    source: "https://delcode.delaware.gov/title10/c081/index.html",
  },
  {
    slug: "district-of-columbia",
    name: "District of Columbia",
    years: 3,
    statute: "D.C. Code § 12-301(8)",
    confidence: "settled",
    source: "https://code.dccouncil.gov/us/dc/council/code/sections/12-301",
    note: "The District's residual three-year period applies. Its one-year period for certain intentional torts such as assault and false imprisonment does not, because Section 1983 borrows the general personal-injury period, not the tort-specific one.",
  },
  {
    slug: "florida",
    name: "Florida",
    years: 4,
    statute: "Fla. Stat. § 95.11(3)(o)",
    confidence: "verify",
    source:
      "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0095/Sections/0095.11.html",
    note: "In 2023 Florida moved actions founded on negligence from the four-year list to a two-year period, now § 95.11(5)(a), for causes of action accruing after March 24, 2023 (HB 837, ch. 2023-15). The residual clause for any action not specifically provided for remains in the four-year list at § 95.11(3)(o), and federal courts have continued to borrow it for Section 1983 claims. The question is live. If your incident is after March 2023, treat two years as the safe deadline and research current Eleventh Circuit and district-court treatment.",
  },
  {
    slug: "georgia",
    name: "Georgia",
    years: 2,
    statute: "O.C.G.A. § 9-3-33",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/ga/title-9-civil-practice/ga-code-sect-9-3-33/",
  },
  {
    slug: "hawaii",
    name: "Hawaii",
    years: 2,
    statute: "Haw. Rev. Stat. § 657-7",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/hi/division-4-courts-and-judicial-proceedings/hi-rev-st-sect-657-7/",
  },
  {
    slug: "idaho",
    name: "Idaho",
    years: 2,
    statute: "Idaho Code § 5-219(4)",
    confidence: "settled",
    source:
      "https://legislature.idaho.gov/statutesrules/idstat/Title5/T5CH2/SECT5-219/",
  },
  {
    slug: "illinois",
    name: "Illinois",
    years: 2,
    statute: "735 Ill. Comp. Stat. 5/13-202",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/il/chapter-735-civil-procedure/il-st-sect-735-5-13-202/",
  },
  {
    slug: "indiana",
    name: "Indiana",
    years: 2,
    statute: "Ind. Code § 34-11-2-4",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/in/title-34-civil-law-and-procedure/in-code-sect-34-11-2-4/",
  },
  {
    slug: "iowa",
    name: "Iowa",
    years: 2,
    statute: "Iowa Code § 614.1(2)",
    confidence: "settled",
    source: "https://www.legis.iowa.gov/docs/code/614.1.pdf",
  },
  {
    slug: "kansas",
    name: "Kansas",
    years: 2,
    statute: "Kan. Stat. Ann. § 60-513(a)(4)",
    confidence: "settled",
    source:
      "https://www.ksrevisor.gov/statutes/chapters/ch60/060_005_0013.html",
  },
  {
    slug: "kentucky",
    name: "Kentucky",
    years: 1,
    statute: "Ky. Rev. Stat. § 413.140(1)(a)",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/ky/title-xxxvi-statutory-actions-and-limitations/ky-rev-st-sect-413-140/",
  },
  {
    slug: "louisiana",
    name: "Louisiana",
    years: 1,
    statute:
      "La. Civ. Code art. 3492 (acts before July 1, 2024); art. 3493.1 (acts on or after July 1, 2024)",
    confidence: "verify",
    source: "https://law.justia.com/codes/louisiana/civil-code/article-3493-1/",
    note: "Louisiana changed its prescriptive period for delictual (tort) actions from one year to two years for acts occurring on or after July 1, 2024 (Act 423 of 2024). For an incident before that date, the one-year period applies. For an incident on or after it, federal courts should borrow the new two-year period, but confirm the Fifth Circuit's treatment before relying on it. Louisiana calls this doctrine prescription, not limitations.",
  },
  {
    slug: "maine",
    name: "Maine",
    years: 6,
    statute: "Me. Rev. Stat. tit. 14, § 752",
    confidence: "settled",
    source: "https://legislature.maine.gov/statutes/14/title14sec752.html",
  },
  {
    slug: "maryland",
    name: "Maryland",
    years: 3,
    statute: "Md. Code, Cts. & Jud. Proc. § 5-101",
    confidence: "settled",
    source:
      "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gcj&section=5-101&enactments=false",
  },
  {
    slug: "massachusetts",
    name: "Massachusetts",
    years: 3,
    statute: "Mass. Gen. Laws ch. 260, § 2A",
    confidence: "settled",
    source:
      "https://malegislature.gov/Laws/GeneralLaws/PartIII/TitleV/Chapter260/Section2A",
  },
  {
    slug: "michigan",
    name: "Michigan",
    years: 3,
    statute: "Mich. Comp. Laws § 600.5805(2)",
    confidence: "settled",
    source: "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-600-5805",
  },
  {
    slug: "minnesota",
    name: "Minnesota",
    years: 6,
    statute: "Minn. Stat. § 541.05, subd. 1(5)",
    confidence: "verify",
    source: "https://www.revisor.mn.gov/statutes/cite/541.05",
    note: "The Eighth Circuit applies Minnesota's six-year period for personal-injury actions not otherwise provided for. Minnesota has shorter periods for specific intentional torts; those do not control a Section 1983 claim.",
  },
  {
    slug: "mississippi",
    name: "Mississippi",
    years: 3,
    statute: "Miss. Code Ann. § 15-1-49",
    confidence: "settled",
    source:
      "https://law.justia.com/codes/mississippi/title-15/chapter-1/section-15-1-49/",
  },
  {
    slug: "missouri",
    name: "Missouri",
    years: 5,
    statute: "Mo. Rev. Stat. § 516.120(4)",
    confidence: "settled",
    source: "https://revisor.mo.gov/main/OneSection.aspx?section=516.120",
  },
  {
    slug: "montana",
    name: "Montana",
    years: 3,
    statute: "Mont. Code Ann. § 27-2-204(1)",
    confidence: "settled",
    source:
      "https://mca.legmt.gov/bills/mca/title_0270/chapter_0020/part_0020/section_0040/0270-0020-0020-0040.html",
  },
  {
    slug: "nebraska",
    name: "Nebraska",
    years: 4,
    statute: "Neb. Rev. Stat. § 25-207(3)",
    confidence: "settled",
    source: "https://nebraskalegislature.gov/laws/statutes.php?statute=25-207",
  },
  {
    slug: "nevada",
    name: "Nevada",
    years: 2,
    statute: "Nev. Rev. Stat. § 11.190(4)(e)",
    confidence: "settled",
    source: "https://www.leg.state.nv.us/nrs/nrs-011.html#NRS011Sec190",
  },
  {
    slug: "new-hampshire",
    name: "New Hampshire",
    years: 3,
    statute: "N.H. Rev. Stat. Ann. § 508:4(I)",
    confidence: "settled",
    source: "https://gc.nh.gov/rsa/html/LII/508/508-4.htm",
  },
  {
    slug: "new-jersey",
    name: "New Jersey",
    years: 2,
    statute: "N.J. Stat. Ann. § 2A:14-2",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/nj/title-2a-administration-of-civil-and-criminal-justice/nj-st-sect-2a-14-2/",
  },
  {
    slug: "new-mexico",
    name: "New Mexico",
    years: 3,
    statute: "N.M. Stat. Ann. § 37-1-8",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/nm/chapter-37-limitation-of-actions-abatement-and-revivor/nm-st-sect-37-1-8/",
  },
  {
    slug: "new-york",
    name: "New York",
    years: 3,
    statute: "N.Y. C.P.L.R. § 214(5)",
    confidence: "settled",
    source: "https://www.nysenate.gov/legislation/laws/CVP/214",
  },
  {
    slug: "north-carolina",
    name: "North Carolina",
    years: 3,
    statute: "N.C. Gen. Stat. § 1-52(16)",
    confidence: "settled",
    source:
      "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_1/GS_1-52.html",
  },
  {
    slug: "north-dakota",
    name: "North Dakota",
    years: 6,
    statute: "N.D. Cent. Code § 28-01-16(5)",
    confidence: "settled",
    source: "https://ndlegis.gov/cencode/t28c01.pdf",
  },
  {
    slug: "ohio",
    name: "Ohio",
    years: 2,
    statute: "Ohio Rev. Code § 2305.10(A)",
    confidence: "settled",
    source: "https://codes.ohio.gov/ohio-revised-code/section-2305.10",
  },
  {
    slug: "oklahoma",
    name: "Oklahoma",
    years: 2,
    statute: "Okla. Stat. tit. 12, § 95(A)(3)",
    confidence: "settled",
    source: "https://law.justia.com/codes/oklahoma/title-12/section-12-95/",
  },
  {
    slug: "oregon",
    name: "Oregon",
    years: 2,
    statute: "Or. Rev. Stat. § 12.110(1)",
    confidence: "settled",
    source: "https://oregon.public.law/statutes/ors_12.110",
  },
  {
    slug: "pennsylvania",
    name: "Pennsylvania",
    years: 2,
    statute: "42 Pa. Cons. Stat. § 5524",
    confidence: "settled",
    source:
      "https://www.palegis.us/statutes/consolidated/view-statute?txtType=HTM&ttl=42&div=0&chapter=55&section=24&subsctn=0",
  },
  {
    slug: "puerto-rico",
    name: "Puerto Rico",
    years: 1,
    statute:
      "P.R. Civil Code of 2020, art. 1204 (31 L.P.R.A. § 9496); formerly art. 1868 (31 L.P.R.A. § 5298)",
    confidence: "verify",
    source:
      "https://www.mcvpr.com/newsroom-publications-New-PR-Civil-Code-Torts",
    note: "Puerto Rico recodified its Civil Code in 2020. The one-year period for tort actions carried over, but the article and section numbers changed. Confirm the citation for your incident date.",
  },
  {
    slug: "rhode-island",
    name: "Rhode Island",
    years: 3,
    statute: "R.I. Gen. Laws § 9-1-14(b)",
    confidence: "settled",
    source:
      "https://webserver.rilegislature.gov/Statutes/TITLE9/9-1/9-1-14.htm",
  },
  {
    slug: "south-carolina",
    name: "South Carolina",
    years: 3,
    statute: "S.C. Code Ann. § 15-3-530(5)",
    confidence: "settled",
    source: "https://www.scstatehouse.gov/code/t15c003.php",
  },
  {
    slug: "south-dakota",
    name: "South Dakota",
    years: 3,
    statute: "S.D. Codified Laws § 15-2-14(3)",
    confidence: "verify",
    source: "https://sdlegislature.gov/Statutes/15-2-14",
    note: "The Eighth Circuit applies South Dakota's three-year period in § 15-2-14(3). The legislature's website did not load when this page was compiled, so the citation was checked against secondary sources only. South Dakota also has a shorter period for certain claims against public entities; that state-law limit does not shorten a Section 1983 claim.",
  },
  {
    slug: "tennessee",
    name: "Tennessee",
    years: 1,
    statute: "Tenn. Code Ann. § 28-3-104(a)(1)",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/tn/title-28-limitation-of-actions/tn-code-sect-28-3-104/",
    note: "Section 28-3-104(a)(1) names civil actions under the federal civil rights statutes expressly. Subdivision (a)(2) extends the period to two years when the injury is also the subject of a criminal prosecution that meets its conditions. Read (a)(2) if you were charged.",
  },
  {
    slug: "texas",
    name: "Texas",
    years: 2,
    statute: "Tex. Civ. Prac. & Rem. Code § 16.003(a)",
    confidence: "settled",
    source: "https://statutes.capitol.texas.gov/Docs/CP/htm/CP.16.htm",
  },
  {
    slug: "utah",
    name: "Utah",
    years: 4,
    statute: "Utah Code § 78B-2-307(4)",
    confidence: "verify",
    source: "https://le.utah.gov/xcode/Title78B/Chapter2/78B-2-S307.html",
    note: "The Tenth Circuit applies Utah's four-year residual period for an action for relief not otherwise provided for by law, § 78B-2-307(4), not the shorter periods for specific torts.",
  },
  {
    slug: "vermont",
    name: "Vermont",
    years: 3,
    statute: "Vt. Stat. Ann. tit. 12, § 512(4)",
    confidence: "settled",
    source: "https://legislature.vermont.gov/statutes/section/12/023/00512",
  },
  {
    slug: "virginia",
    name: "Virginia",
    years: 2,
    statute: "Va. Code Ann. § 8.01-243(A)",
    confidence: "settled",
    source:
      "https://law.lis.virginia.gov/vacode/title8.01/chapter4/section8.01-243/",
  },
  {
    slug: "washington",
    name: "Washington",
    years: 3,
    statute: "Wash. Rev. Code § 4.16.080(2)",
    confidence: "settled",
    source: "https://app.leg.wa.gov/rcw/default.aspx?cite=4.16.080",
  },
  {
    slug: "west-virginia",
    name: "West Virginia",
    years: 2,
    statute: "W. Va. Code § 55-2-12(b)",
    confidence: "settled",
    source: "https://code.wvlegislature.gov/55-2-12/",
  },
  {
    slug: "wisconsin",
    name: "Wisconsin",
    years: 3,
    statute: "Wis. Stat. § 893.53",
    confidence: "verify",
    source: "https://docs.legis.wisconsin.gov/statutes/statutes/893/V/53",
    note: "Wisconsin cut the period from six years to three for causes of action accruing on or after April 5, 2018 (2017 Wis. Act 235). Section 893.53 is the residual injury-to-rights statute that state annotations identify as the one applicable to Section 1983 actions; § 893.54 (injury to the person) is also three years. An incident before April 2018 has six years.",
  },
  {
    slug: "wyoming",
    name: "Wyoming",
    years: 4,
    statute: "Wyo. Stat. Ann. § 1-3-105(a)(iv)(C)",
    confidence: "settled",
    source:
      "https://codes.findlaw.com/wy/title-1-code-of-civil-procedure/wy-st-sect-1-3-105/",
  },
];

export function limitationsFor(slug: string) {
  return STATE_LIMITATIONS.find((s) => s.slug === slug);
}
