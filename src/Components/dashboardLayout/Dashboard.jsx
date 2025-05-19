import { useState } from 'react';
import { useEffect } from 'react';
import API from '../../config/API';
import { useNavigate } from 'react-router-dom';
export default function Dashboard (){
      const [adminData,setadminData] = useState(null)
  const navigate= useNavigate()

        useEffect(()=>{
        const FetchData = async()=>{
        try{
        const response = await API.get('Admin/dashboard',{
        withCredentials: true
        })
        setadminData(response.data)
      }
      catch(error){
        console.error("unAuthorized",error);
        navigate('/admin-Login')
      }
    }
    FetchData();
  },[])
    return (
        <div>
            <h1 className="bg-blue-600 text-4xl ">Welcome to Admin Dashboard</h1>
        {adminData  ?(
            <div>
                <p>Logged In as : <strong>{adminData.user?.email}</strong></p>
                <p className="text-green-600 mt-2">{adminData.message}</p>
                </div>
        ):
         <p className="text-gray-500">Loading dashboard data...</p>
    }
        </div>
    )
}