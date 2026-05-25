import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-mh-paper-2 flex flex-col">
      <TopNav />
      <main className="flex-1 px-9 lg:px-14 py-9">
        <Outlet />
      </main>
    </div>
  );
}
