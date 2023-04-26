import {useContext, useEffect, useState} from "react";
import {setNavDisplay} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";

export default function Show() {
    const ip = useContext(GlobalContext).ip
    const [logsList, setLogsList] = useState([])

    useEffect(()=> {
        setNavDisplay(true)
        const interval = setInterval(()=> {
            fetch(`${ip}/logs/show`)
                .then(res => {return res.json()})
                .then(setLogsList)
        },1000)
        return ()=> clearInterval(interval)
    },[])

    const handleArchive = ()=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Confirm', 'Cancel'],
            message: `Confirm to archive.`,
            noLink: true,
            title: 'Logs Archive',
            defaultId: 0
        }).then((num)=> {
            if(num === 0) {
                fetch(`${ip}/logs/archive`)
                    .then(()=> {
                        ipcRenderer.send('showMessage','Logs Archive','Logs has been successfully archived')
                    })
            }
        })
    }

    return (
        <div className="logs-container">
            <table className="logs-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                {
                    logsList.map(item => {
                        return (
                            <tr key={item.num}>
                                <td>{item.user}</td>
                                <td>{item.action}</td>
                                <td><div>{item.description}</div></td>
                                <td>{item.timestamp}</td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
            <div>
                <input type="button" className={'btn'} defaultValue={'Archive'} onClick={handleArchive}/>
            </div>
        </div>
    )
}