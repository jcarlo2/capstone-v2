import {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {GlobalContext} from "../../context/GlobalContext";
import {useRouter} from "next/router";

export const SettingsModal = forwardRef(({},ref)=> {
    const router = useRouter()
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const modal = useContext(GlobalContext).modalRef.current.settings
    const {username, role} = useContext(GlobalContext).user
    const userTable = useRef()
    const create = useRef()
    const change = useRef()
    const archive = useRef()
    const listBtn = useRef()
    const createBtn = useRef()
    const archiveBtn = useRef()
    const createFirstName = useRef()
    const createLastName = useRef()
    const changeOldPassword = useRef()
    const changeNewPassword = useRef()
    const archiveId = useRef()
    const archivePassword = useRef()
    const prevRandomId = useRef(0)
    const [intervalRandomId, setIntervalRandomId] = useState(0)
    const [randomId, setRandomId] = useState('100000')
    const [userList, setUserList] = useState([])

    useEffect(()=> {
        listBtn.current.style.display = role === 0 ? 'inline-block' : 'none'
        createBtn.current.style.display = role === 0 ? 'inline-block' : 'none'
        archiveBtn.current.style.display = role === 0 ? 'inline-block' : 'none'
        let listInterval = 0
        if(role === 0) {
            handleHeaderClick('list')
            listInterval = findAllActiveUser()
        } else handleHeaderClick('change')
        return ()=> clearInterval(listInterval)
    },[role,ip])

    useEffect(()=> {
        setIntervalRandomId(setInterval(()=> {
            fetch(`${ip}/user/random-id?id=${randomId}`)
                .then(res => {return res.text()})
                .then(setRandomId)
        },1000))

        return ()=> clearInterval(intervalRandomId)
    },[randomId,ip])

    useEffect(()=> {
        clearInterval(prevRandomId.current)
        prevRandomId.current = intervalRandomId
    },[intervalRandomId])


    const findAllActiveUser = ()=> {
        return setInterval(() => {
            fetch(`${ip}/user/user-list`)
                .then(res => {
                    return res.json()
                })
                .then(setUserList)
        }, 1000)
    }

    const handleHeaderClick = (text)=> {
        userTable.current.classList.add('hidden')
        create.current.classList.add('hidden')
        change.current.classList.add('hidden')
        archive.current.classList.add('hidden')
        if(text === 'list') userTable.current.classList.remove('hidden')
        else if(text === 'create') create.current.classList.remove('hidden')
        else if(text === 'change') change.current.classList.remove('hidden')
        else archive.current.classList.remove('hidden')
    }

    const handleLogout = ()=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Confirm', 'Cancel'],
            message: `Confirm to logout.`,
            noLink: true,
            title: 'Logout',
            defaultId: 0
        }).then(num => {
            reset()
            modal.classList.add('hidden')
            if(num === 0) router.push('/home')
        })
    }

    const handleCreate = ()=> {
        const firstName = createFirstName.current.value
        const lastName = createLastName.current.value

        if(firstName.replaceAll(' ','').length === 0
        || lastName.replaceAll(' ','').length === 0) {
            ipcRenderer.send('showError','Create Account','Check empty input')
        } else {
            fetch(`${ip}/user/create`,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: randomId,
                    firstName: firstName,
                    lastName: lastName,
                    role: -1
                })
            }).then(()=> {
                ipcRenderer.send('showMessage','Create Account',`Account successfully created.\nUsername and Password is ${randomId}`)
                reset()
            })
        }
    }

    const handleChangePassword = ()=> {
        const oldPassword = changeOldPassword.current.value
        const newPassword = changeNewPassword.current.value
        if(oldPassword.replaceAll(' ','').length === 0
        || newPassword.replaceAll(' ','').length <= 8)
            ipcRenderer.send('showError','Change Password','Enter a password')
        else {
            fetch(`${ip}/user/change-password?id=${username}&oldPassword=${oldPassword}&newPassword=${newPassword}`)
                .then(res => {return res.json()})
                .then(hasCompleted => {
                    if(hasCompleted) {
                        ipcRenderer.send('showMessage','Change Password','Password changed successfully')
                        reset()
                    }else ipcRenderer.send('showError','Change Password','Invalid old password')
                })
        }
    }

    const handleArchive = ()=> {
        const id = archiveId.current.value.replaceAll(' ','')
        const password = archivePassword.current.value.replaceAll(' ','')
        if(id.length === 0 || id.length < 6) ipcRenderer.send('showError','Archive Account','Input a valid username')
        else {
            fetch(`${ip}/user/archive?id=${id}&password=${password}`)
                .then(res => {return res.json()})
                .then(hasCompleted => {
                    if(hasCompleted) {
                        ipcRenderer.send('showMessage','Archive Account','Account has been archived')
                        reset()
                    }else ipcRenderer.send('showError','Archive Account','Invalid username or admin password')
                })
        }
    }

    const reset = ()=> {
        createFirstName.current.value = ''
        createLastName.current.value = ''
        changeOldPassword.current.value = ''
        changeNewPassword.current.value = ''
        archiveId.current.value = ''
        archivePassword.current.value = ''
    }

    return (
        <div className="modal-bg hidden" ref={ref}
            onClick={(e)=> {
                if(e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden')
                    handleHeaderClick('list')
                    reset()
                }
            }}
        >
            <div className="modal-container modal-lg settings-modal">
                <div className="modal-header">
                    <input ref={listBtn} onClick={()=> handleHeaderClick('list')} type="button" className={'btn'} defaultValue={'List'}/>
                    <input ref={createBtn} onClick={()=> handleHeaderClick('create')} type="button" className={'btn'} defaultValue={'Create Account'}/>
                    <input onClick={()=> handleHeaderClick('change')} type="button" className={'btn'} defaultValue={'Change Password'}/>
                    <input ref={archiveBtn} onClick={()=> handleHeaderClick('archive')} type="button" className={'btn'} defaultValue={'Archive'}/>
                    <input onClick={handleLogout} type="button" className={'btn'} defaultValue={'Logout'}/>
                </div>
                <div className="modal-body">
                    <table ref={userTable} className={'logs-table'}>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            userList.map(item => (
                                <tr key={item.username}>
                                    <td>{item.username}</td>
                                    <td>{`${item.lastName}, ${item.firstName}`}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                    <div ref={create} className="create hidden">
                        <input type="text" readOnly={true} placeholder={'Username'} value={randomId} style={{textAlign: "center"}}/>
                        <input ref={createFirstName} type="text" placeholder={'First Name'}/>
                        <input ref={createLastName} type="text" placeholder={'Last Name'}/>
                        <input type="button" className={'btn create'} defaultValue={'Create'} onClick={handleCreate}/>
                    </div>
                    <div ref={change} className="change hidden">
                        <input type="text" readOnly={true} placeholder={'Id'} value={username}/>
                        <input ref={changeOldPassword} type="password" placeholder={'Old Password'}/>
                        <input ref={changeNewPassword} type="password" placeholder={'New Password'}/>
                        <input type="button" className={'btn change'} defaultValue={'Change Password'} onClick={handleChangePassword}/>
                    </div>
                    <div ref={archive} className="archive hidden">
                        <input ref={archiveId} type="text" placeholder={'Username'}/>
                        <input ref={archivePassword} type="password" placeholder={'Admin Password'}/>
                        <input type="button" className={'btn archived'} defaultValue={'Archive'} onClick={handleArchive}/>
                    </div>
                </div>
            </div>
        </div>
    )
})