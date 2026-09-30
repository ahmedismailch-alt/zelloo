export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#f8f9fb] p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Zelloo Restaurant Management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border">
            <p className="text-gray-500 text-sm">Restaurants</p>
            <p className="text-3xl font-black mt-2">0</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border">
            <p className="text-gray-500 text-sm">Reservations</p>
            <p className="text-3xl font-black mt-2">0</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border">
            <p className="text-gray-500 text-sm">Users</p>
            <p className="text-3xl font-black mt-2">0</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border">
          <h2 className="text-xl font-bold mb-4">
            Restaurants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Restaurant Name"
              className="border rounded-xl px-4 py-3"
            />

            <input
              type="email"
              placeholder="E-Mail"
              className="border rounded-xl px-4 py-3"
            />
          </div>

          <button className="mt-4 bg-black text-white rounded-xl px-6 py-3 font-bold">
            Add Restaurant
          </button>
        </div>
      </div>
    </main>
  )
}
