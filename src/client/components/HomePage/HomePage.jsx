import React from 'react';
import Sidebar from 'components/Sidebar';
import ContentPanel from 'components/ContentPanel';

function HomePage() {
  return (
    <main className='main-container'>
      <div className='sidebar'>
        <Sidebar />
      </div>
      <div className='content'>
        <ContentPanel />
      </div>
    </main>
  );
}

export default HomePage;
