import React, { PureComponent } from 'react';
import NavBar from '../../components/NavBar';
import PageHeader from '../../components/PageHeader';
import HomePage from '../../components/HomePage';
import ConnectedModal from '../../components/Modals/Modal';
import '../../styles/layout.scss';

export class PageLayout extends PureComponent {
  render() {
    return (
      <div className='container'>
        <header>
          <NavBar />
          <PageHeader />
        </header>
        <HomePage />
        <ConnectedModal />
        <footer></footer>
      </div>
    );
  }
}

export default PageLayout;
