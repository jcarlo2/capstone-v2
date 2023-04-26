import {useContext, useEffect, useRef, useState} from "react";
import {dropdownClickHandler, handleScroll, toggleDropdownList} from "../helper/GlobalHelper";
import {GlobalContext} from "../context/GlobalContext";

export const TransactionReportList = ({isHistory})=> {
    const ip = useContext(GlobalContext).ip
    const setReturnId = useContext(GlobalContext).setReturnReportId
    const setHistoryId = useContext(GlobalContext).setTransactionHistoryReportId
    const option = useRef()
    const [dateToday, setDateToday] = useState('2100-01-01')
    const [dropdownBtn, setDropdownBtn] = useState('Active')
    const [reportList, setReportList] = useState([])
    const [reportOption, setReportOption] = useState({
        isValid:    true,
        isArchived: false,
        search:     '',
        start:      '2000-12-31T23:59:59',
        end:        '3023-12-31T23:59:59',
        size:       50
    })

    useEffect(()=> {
        getDateToday()
        document.addEventListener('click',dropdownClickHandler)
        return ()=> document.removeEventListener('click',dropdownClickHandler)
    },[])

    useEffect(()=> {
        const interval = setInterval(()=> {
            fetch(`${ip}/transaction/find-report?` +
                            `isValid=${reportOption.isValid}&` +
                            `isArchived=${reportOption.isArchived}&`+
                            `search=${reportOption.search}&` +
                            `start=${reportOption.start}&` +
                            `end=${reportOption.end}&` +
                            `size=${reportOption.size}`
            ).then((res)=> {
                res.json().then(data => {
                    setReportList(data)
                })
            })
        },1000)
        return ()=> clearInterval(interval)
    },[reportOption])

    const getDateToday = ()=> {
        fetch(`${ip}/date/get-date`)
            .then(res => {return res.text()})
            .then(date => setDateToday(date.split(' ')[0]))
    }

    const setIsValidAndIsArchived = (text) => {
        let isValid = true
        let isArchived = false

        if(text === 'Archived') isArchived = true
        else if(text === 'Inactive') {
            isValid = false
            isArchived = true
        }

        setReportOption(prevState => ({
            ...prevState,
            isValid: isValid,
            isArchived: isArchived
        }))
    }

    return (
        <>
            <table className={'report-list-table'}>
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody onScroll={(e)=> handleScroll(e,setReportOption)}>
                    {reportList.map(report => (
                        <tr key={report.id} onClick={()=> isHistory ? setHistoryId(report.id) : setReturnId(report.id)}>
                            <td>{report.id}</td>
                            <td>{report.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className={'report-list-option'}>
                <div style={{display: `${isHistory ? 'flex': 'none'}`}} className={'dropdown'}>
                    <input type="button" className={'btn dropdown-btn'} value={dropdownBtn}
                           onClick={()=> {
                               toggleDropdownList(option.current)
                           }}
                    />
                    <ul ref={option} className={'dropdown-list'}>
                        <li onClick={(e)=> {
                            setDropdownBtn(e.currentTarget.textContent)
                            setIsValidAndIsArchived(e.currentTarget.textContent)
                        }}>Active</li>
                        <li onClick={(e)=> {
                            setDropdownBtn(e.currentTarget.textContent)
                            setIsValidAndIsArchived(e.currentTarget.textContent)
                        }}>Archived</li>
                        <li onClick={(e)=> {
                            setDropdownBtn(e.currentTarget.textContent)
                            setIsValidAndIsArchived(e.currentTarget.textContent)
                        }}>Inactive</li>
                    </ul>
                </div>
                <div>
                    <input onChange={(e)=> {
                        const text = e.currentTarget.value
                        setReportOption(prev => ({
                            ...prev,
                            search: text
                        }))
                    }} type="text" placeholder={'Search by id ...'}/>
                </div>
                <div>
                    <div>
                        <span>Start</span>
                        <input type="date" max={dateToday}
                           onChange={(e)=> {
                               const date = `${e.currentTarget.value}T00:00:00`
                               setReportOption(prevState => ({
                                   ...prevState,
                                   start: date
                               }))
                           }}
                        />
                    </div>
                    <div>
                        <span>End</span>
                        <input type="date" max={dateToday}
                           onChange={(e)=> {
                               const date = `${e.currentTarget.value}T23:59:59`
                               setReportOption(prevState => ({
                                   ...prevState,
                                   end: date
                               }))
                           }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}