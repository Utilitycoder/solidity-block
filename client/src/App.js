import React from "react"
import { Container } from "@material-ui/core"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"

import Home from "./components/Home/Home"
import Header from "./components/Header/header"
import Auth from "./components/Auth/Auth"
import Sample from "./components/Sample/Sample"
import ChatAI from "./components/ChatAI/chatAIComponent"


function App() {
    return (
        <GoogleOAuthProvider clientId="988986535788-d58fi8gh2f2oou8kcnvubfag4p1a17nt.apps.googleusercontent.com">
        <BrowserRouter>
            <Container maxWidth="lg">
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/sample" element={<Sample />} />
                    <Route path="/askAI" element={<ChatAI />} />
                </Routes>
            </Container>
        </BrowserRouter>
        </GoogleOAuthProvider>
    )
}

export default App
