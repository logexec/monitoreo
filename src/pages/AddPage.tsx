import AddTripForm from "@/components/AddTripForm";

export function AddPage() {
  return (
    <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Agregar Viajes
      </h2>
      <section className="p-5 rounded-lg border shadow-md">
        <AddTripForm />
      </section>
    </main>
  );
}
