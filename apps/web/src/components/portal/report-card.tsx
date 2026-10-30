import Image from "next/image";
import { PrintButton } from "@/components/portal/print-button";
import { campuses, formatPhone, school } from "@/content/school";
import { gradeFor } from "@/lib/portal/grading";
import type { PublishedReport } from "@/lib/portal/queries";

// Layout follows the school's report card format. Scores, grades and class figures come from the published results;
// anything the portal does not record yet stays blank, as on the school's own cards.
const meanings: Record<string, string> = { A: "Excellent", B: "Very good", C: "Good", D: "Pass", E: "Poor", F: "Fail" };
const affectiveTraits = ["Punctuality", "Mental Alertness", "Behavior", "Reliability", "Attentiveness", "Respect", "Neatness", "Politeness", "Honesty", "Relationship with staff", "Relationship with students", "Attitude to school", "Self-control"];
const teamTraits = ["Spirit of teamwork", "Initiatives", "Organizational ability"];
const psychomotorSkills = ["Handwriting", "Reading", "Verbal fluency/Diction", "Musical Skills", "Creative arts", "Physical education", "General reasoning"];
const observationKey = [
  [5, "Maintains an excellent degree of observation"], [4, "Maintains high level of observation trait"], [3, "Acceptable level of observation trait"],
  [2, "Shows minimal level of observation trait"], [1, "Has no regard for observation trait"],
] as const;

const date = (value: Date) => value.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
const show = (value: number | null | undefined) => value === null || value === undefined ? "—" : String(Math.round(value * 100) / 100);
const remark = (grade: string | null) => (grade && meanings[grade]) || "—";

function Ratings({ heading, items }: { heading: string; items: string[] }) {
  return <table className="rc-table rc-ratings">
    <thead><tr><th scope="col">{heading}</th><th scope="col">Rating</th></tr></thead>
    <tbody>{items.map(item => <tr key={item}><th scope="row">{item}</th><td><span className="visually-hidden">Not recorded</span></td></tr>)}</tbody>
  </table>;
}

export function ReportCard({ report }: { report: PublishedReport }) {
  const { snapshot: card, bands: unsorted, classStatistics: stats } = report;
  const bands = [...unsorted].sort((a, b) => b.min - a.min);
  const maximum = card.policy.caMax + card.policy.examMax;
  const bandRange = (index: number) => index === 0 ? `${bands[0].min} – ${maximum}` : `${bands[index].min} to below ${bands[index - 1].min}`;
  const performance = remark(gradeFor(card.average, { bands }));
  return <article className="report-card" aria-labelledby={`report-${report.id}`}>
    <header className="rc-masthead">
      <Image src="/brand/brainfield-logo.jpg" width={84} height={84} alt="Brainfield Schools Lagos crest" className="rc-crest" />
      <div className="rc-school">
        <p className="rc-school-name">Brainfield Schools</p>
        <p>{campuses.map(campus => `${campus.name}: ${campus.address}`).join(" · ")}</p>
        <p>Phone: {school.phones.map(formatPhone).join(" · ")}</p>
      </div>
      <PrintButton />
    </header>
    <h2 id={`report-${report.id}`} className="rc-title">{card.className} report card <span>· {card.termName} · {card.sessionName}</span></h2>

    <div className="rc-info">
      <dl>
        <div><dt>Session</dt><dd>{card.sessionName}</dd></div>
        <div><dt>Name of student</dt><dd>{card.studentName}</dd></div>
        <div><dt>Class</dt><dd>{card.className}</dd></div>
      </dl>
      <dl>
        <div><dt>Term</dt><dd>{card.termName}</dd></div>
        <div><dt>Admission no.</dt><dd>{card.admissionNumber}</dd></div>
        <div><dt>Next term begins</dt><dd>—</dd></div>
      </dl>
      <dl>
        <div><dt>No. of days school opened</dt><dd>—</dd></div>
        <div><dt>No. of days present</dt><dd>—</dd></div>
        <div><dt>No. of days absent</dt><dd>—</dd></div>
      </dl>
      <dl>
        <div><dt>Position in entire class</dt><dd>—</dd></div>
        <div><dt>Overall total score</dt><dd>{show(card.totalScore)}</dd></div>
        <div><dt>Student’s average score</dt><dd>{show(card.average)}</dd></div>
        <div><dt>Subjects graded</dt><dd>{card.gradedSubjects}</dd></div>
      </dl>
      <dl>
        <div><dt>No. of students in class</dt><dd>{stats.students}</dd></div>
        <div><dt>Class average score</dt><dd>{show(stats.average)}</dd></div>
        <div><dt>Highest average in class</dt><dd>{show(stats.highest)}</dd></div>
        <div><dt>Lowest average in class</dt><dd>{show(stats.lowest)}</dd></div>
      </dl>
      <dl className="rc-verdict">
        <div><dt>Overall performance</dt><dd>{performance}</dd></div>
      </dl>
    </div>

    <div className="table-scroll" role="region" aria-label="Subject results" tabIndex={0}>
      <table className="rc-table rc-subjects">
        <thead><tr>
          <th scope="col">Subject</th><th scope="col">CA ({card.policy.caMax})</th><th scope="col">Exam ({card.policy.examMax})</th><th scope="col">Total ({maximum})</th><th scope="col">Grade</th>
          <th scope="col">Subject position</th><th scope="col">Class average</th><th scope="col">Highest in class</th><th scope="col">Lowest in class</th><th scope="col">Remark</th>
        </tr></thead>
        <tbody>{card.subjects.map(subject => {
          const figures = stats.subjects[subject.subject];
          return <tr key={subject.subject}>
            <th scope="row">{subject.subject}</th>
            {subject.attendance === "present" ? <>
              <td>{show(subject.ca)}</td><td>{show(subject.exam)}</td><td>{show(subject.total)}</td><td className="rc-grade">{subject.grade ?? "—"}</td>
              <td>—</td><td>{show(figures?.average)}</td><td>{show(figures?.highest)}</td><td>{show(figures?.lowest)}</td>
              <td className={subject.grade === "F" ? "rc-remark rc-remark-fail" : "rc-remark"}>{remark(subject.grade)}</td>
            </> : <td colSpan={9} className="attendance-text">{subject.attendance}</td>}
          </tr>;
        })}</tbody>
      </table>
    </div>

    <div className="rc-lower">
      <Ratings heading="Affective traits" items={affectiveTraits} />
      <div className="rc-stack">
        <Ratings heading="Affective traits" items={teamTraits} />
        <Ratings heading="Psychomotor skills" items={psychomotorSkills} />
      </div>
      <div className="rc-stack">
        <table className="rc-table">
          <caption className="visually-hidden">Grade key</caption>
          <thead><tr><th scope="col">Score range</th><th scope="col">Grade</th><th scope="col">Meaning</th></tr></thead>
          <tbody>{bands.map((band, index) => <tr key={band.grade}><td>{bandRange(index)}</td><th scope="row">{band.grade}</th><td>{meanings[band.grade] ?? "—"}</td></tr>)}</tbody>
        </table>
        <table className="rc-table">
          <caption className="visually-hidden">Rating key</caption>
          <thead><tr><th scope="col">Key</th><th scope="col">Meaning</th></tr></thead>
          <tbody>{observationKey.map(([key, meaning]) => <tr key={key}><th scope="row">{key}</th><td>{meaning}</td></tr>)}</tbody>
        </table>
      </div>
    </div>

    <table className="rc-table rc-remarks">
      <tbody>
        <tr><th scope="row">Promotion status</th><td>—</td></tr>
        <tr><th scope="row">Class teacher’s report</th><td>—</td></tr>
        <tr><th scope="row">Principal/Headmaster’s report</th><td>—</td></tr>
      </tbody>
    </table>
    <footer>Published {date(report.publishedAt)}{report.revision > 1 ? ` · Revision ${report.revision}` : ""} · {card.policy.name}{card.policy.schoolApproved ? "" : " (placeholder until the school approves its grading policy)"}. Subject positions, attendance and ratings are not recorded in the portal yet.</footer>
  </article>;
}
