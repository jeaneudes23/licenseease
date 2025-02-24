import LicensesAccordion from "@/features/licenses/components/LicensesAccordion";


export default function Home() {
  return (
    <main className="">
      <div className="bg-primary text-primary-foreground py-12 ">
        <h2 className="text-4xl font-extrabold container capitalize">Licensing IT services</h2>
      </div>
      <div className="max-w-screen-md mx-auto py-8">
        <LicensesAccordion />
      </div>
    </main>
  );
}
