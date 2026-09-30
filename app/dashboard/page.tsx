"use client"

import { useState } from "react"

type Restaurant = {
  id: number
  name: string
  email: string
}

export default function Dashboard() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  function addRestaurant() {
    if (!name.trim() || !email.trim()) {
      alert("Please enter restaurant name and e-mail.")
      return
    }

    const restaurant: Restaurant = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
    }

    setRestaurants((current) => [...current, restaurant])
    setName("")
    setEmail("")
  }

  function deleteRestaurant(id: number) {
    setRestaurants((current) =>
      current.filter((restaurant) => restaurant.id !== id)
    )
  }

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

            <p className="text-3xl font-black mt-2">
              {restaurants.length}
            </p>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Restaurant Name"
              className="border rounded-xl px-4 py-3"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="E-Mail"
              className="border rounded-xl px-4 py-3"
            />
          </div>

          <button
            onClick={addRestaurant}
            className="mt-4 bg-black text-white rounded-xl px-6 py-3 font-bold"
          >
            Add Restaurant
          </button>

          {restaurants.length > 0 && (
            <div className="mt-6 space-y-3">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="border rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-bold">
                      {restaurant.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {restaurant.email}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteRestaurant(restaurant.id)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
