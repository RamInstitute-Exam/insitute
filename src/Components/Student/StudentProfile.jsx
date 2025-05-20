import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import API from '../../config/API'
import { useEffect, useState } from 'react'

export default function StudentProfile() {
  const [studentData, setStudentData] = useState({})

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setStudentData(prev => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) return;

    const FetchUserData = async () => {
      try {
        const response = await API.get(`Student/student-profile/${userId}`)
        setStudentData(response.data.studentdetails)
      } catch (error) {
        console.error("Failed to fetch student data", error)
      }
    }

    FetchUserData()
  }, [])

  return (
    <form>
      <div className="space-y-12">
        {/* === PERSONAL INFORMATION SECTION === */}
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
          
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={studentData.name || ''}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-indigo-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={studentData.email || ''}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-indigo-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-900">
                Mobile Number
              </label>
              <input
                type="text"
                name="mobileNumber"
                id="mobileNumber"
                value={studentData.mobileNumber || ''}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-indigo-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-900">
                WhatsApp Number
              </label>
              <input
                type="text"
                name="whatsappNumber"
                id="whatsappNumber"
                value={studentData.whatsappNumber || ''}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-indigo-600"
              />
            </div>

            <div className="col-span-full">
              <label htmlFor="permanent_address" className="block text-sm font-medium text-gray-900">
                Address
              </label>
              <input
                type="text"
                name="permanent_address"
                id="permanent_address"
                value={studentData.permanent_address || ''}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:outline-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
