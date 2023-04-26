import React, {createRef, useContext, useEffect, useState} from "react";
import {useRouter} from "next/router";
import {GlobalContext} from "../context/GlobalContext";
import {setNavDisplay} from "../helper/GlobalHelper";

export const Login = ()=> {
    const router = useRouter()
    const setUser = useContext(GlobalContext).setUser
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const ipModal = useContext(GlobalContext).modalRef.current.ipModal
    const userElem = createRef()
    const passElem = createRef()
    const loginButton = createRef()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')


    useEffect(()=> {
        setNavDisplay(false)
        userElem.current.focus()
        loginButton.current.classList.remove('disabled')
    },[username,password])

    const verify = (username,password)=> {
        fetch(ip + `/user/verify?username=${username}&password=${password}`)
            .then(r => {return r.text()})
            .then((r)=> {
                if(r === 'true') {
                    getInformation(username,password)
                } else ipcRenderer.send('showError','Login', 'Check username or password')
            }).catch(()=> ipcRenderer.send('showError','Login', 'Check server connection'))
    }

    const getInformation = (username,password)=> {
        fetch(ip + `/user/get-info?username=${username}&password=${password}`)
            .then((r)=> {return r.json()})
            .then(data => {
                setUser({
                    username: username,
                    password: password,
                    firstName: data['firstName'],
                    lastName: data['lastName'],
                    role: data['role'],
                    token: '',
                })
                router.push('/dashboard')
            }).catch(()=> ipcRenderer.send('showError','Login', 'Check server connection'))
    }

    const doLoggedinEvent = ()=> {
        const username = userElem.current.value
        const password = passElem.current.value
        setUsername(username)
        setPassword(password)
        verify(username,password)
    }

    return (
        <div>
            <div className="bubbles">
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="container">
                    <img className={'ip-button'} src="/images/setting.svg" alt="setting"
                        onClick={()=> {
                            ipModal.classList.remove('hidden')
                        }}
                    />
                    <h1>HLC GROCERY</h1>
                    <div>
                        <label>
                            <input ref={userElem}
                                   defaultValue={username}
                                   type="text"
                                   placeholder="Username"/>
                            <input ref={passElem}
                                   type="password"
                                   defaultValue={password}
                                   placeholder="Password"/>
                            <div>
                                <button
                                    ref={loginButton}
                                    onClick={doLoggedinEvent}
                                    className={'disabled'}
                                    >Login</button>
                                <div id="spinner-login" role="status"></div>
                            </div>
                        </label>
                    </div>
                </div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
            </div>
        </div>
    )
}