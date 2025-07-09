import LicensesAccordion from "@/features/licenses/components/LicensesAccordion";

import LicenseCategories from "@/components/homepage/licenceCategories";
import ApplicationSteps from "@/components/homepage/applicationSteps";
import SampleRequirements from "@/components/homepage/sample";

export default function Home() {
  return (
    <main className="">
      <div className="bg-primary text-primary-foreground py-12 ">
        <h2 className="text-4xl font-extrabold container capitalize">Licensing IT services</h2>
      </div>
      <div className="max-w-screen-md mx-auto py-8">
        <LicensesAccordion />
      </div>
        <LicenseCategories />
        <ApplicationSteps />
        <SampleRequirements />
    </main>
  );
}
