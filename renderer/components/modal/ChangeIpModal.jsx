import {forwardRef, useContext, useEffect, useRef} from "react";
import {validateIP} from "../../helper/GlobalHelper";
import fs from "fs";
import {GlobalContext} from "../../context/GlobalContext";

export const ChangeIpModal = forwardRef(({},ref)=> {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const setIp = useContext(GlobalContext).setIp
    const modal = useContext(GlobalContext).modalRef.current.ipModal
    const ipInput = useRef()

    useEffect(()=> {
        ipInput.current.value = ''
    },[ip])

    const handleChangeIp = ()=> {
        const ip = ipInput.current.value
        if(validateIP(ip)) {
            setIp(`http://${ip}:8092/api`)
            fs.writeFile('ip-config.txt', JSON.stringify({ip: ip }), (err) => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('Data has been written to file')
                modal.classList.add('hidden')
            })
        }else ipcRenderer.send('showError','IP','Invalid IP format.\nExample: 192.168.1.100')
    }

    return (
        <div className="modal-bg hidden" ref={ref}
            onClick={(e)=> {
                if(e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden')
                }
            }}
        >
            <div className="modal-container modal-h-sm modal-ip">
                <div className="modal-body">
                    <div className={'ip-input'}>
                        <h3>IP</h3>
                        <input ref={ipInput} type="text" placeholder={'192.168.1.100'}/>
                    </div>
                    <input type="button" className={'btn'} defaultValue={'Change'} onClick={handleChangeIp}/>
                </div>
            </div>
        </div>
    )
})