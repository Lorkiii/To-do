import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

const Userspage = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users", {
    cache: "no-store",
  });
  const users: User[] = await res.json();
  return (
    <>
      <h1>Users</h1>
      <p>Time: {new Date().toLocaleTimeString()}</p>
      <p>Here are all the users:</p>

      {/* Table  */}
      <Table>
        <TableCaption>List of users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="p-2">Name</TableHead>
            <TableHead className="p-2">Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="p-2">{user.name}</TableCell>
              <TableCell className="p-2">{user.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Userspage;
