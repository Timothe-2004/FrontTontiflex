// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const data = [
//   {
//     name: 'Jan',
//     uv: 4000,
//     pv: 2400,
//     amt: 2400,
//   },
//   {
//     name: 'Feb',
//     uv: 3000,
//     pv: 1398,
//     amt: 2210,
//   },
//   {
//     name: 'Mar',
//     uv: 2000,
//     pv: 9800,
//     amt: 2290,
//   },
//   {
//     name: 'Apr',
//     uv: 2780,
//     pv: 3908,
//     amt: 2000,
//   },
//   {
//     name: 'May',
//     uv: 1890,
//     pv: 4800,
//     amt: 2181,
//   },
//   {
//     name: 'Jun',
//     uv: 2390,
//     pv: 3800,
//     amt: 2500,
//   },
// ];

// export function Overview() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Statistiques Globales</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-[300px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }



import React from "react";  

export function Overview() {
   return (
   <div>
    Overview
   </div>
   );
}
