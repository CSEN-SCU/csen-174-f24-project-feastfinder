import {createContext, React, useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from './SocketContext';

// pages for react js in order
import Login_page from './Login_page';
import Home_page from './Home_page';
import Profile_page from './Profile_page';
import Group_page from './Create_group';
import GroupPage from './GroupPage';


import Vote_join from './Vote_join';
import Vote_start from './Vote_start';
import Vote_pref from './Vote_pref';
import Vote_voting from './Vote_voting';
import Vote_final from './Vote_final';
import NotFound from './NotFound';


const App = () => {
    return( 
        <SocketProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login_page/>} />
                    <Route path="/home" element={<Home_page/>} />
                    <Route path="/profile" element={<Profile_page/>} />
                    <Route path="/create_group" element={<Group_page/>} />
                    {/* <Route path="/group" element={<Group_page/>} />
                    <Route path="/user" element={<User_page/>} /> */}
                    <Route path="/group/:groupId" element={<GroupPage />} />


                    {/* voting pages */}
                    <Route path="/join" element={<Vote_join/>} />
                    <Route path="/start" element={<Vote_start/>} />
                    <Route path="/pref" element={<Vote_pref />} />
                    <Route path="/voting" element={<Vote_voting />} />
                    <Route path="/final" element={<Vote_final />} />
                    <Route path="/*" element={<NotFound/>} />
                </Routes>
            </BrowserRouter>
        </SocketProvider>

  )
}

export default App;