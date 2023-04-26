import { Document, Packer, Paragraph, TextRun, Table, TableRow, UnderlineType, Footer,
    TableCell, AlignmentType, WidthType,NumberFormat,PageNumber } from "docx";
import fs from 'fs';
import {add, fixNumber} from "./GlobalHelper";
import {useContext} from "react";
import {GlobalContext} from "../context/GlobalContext";

export const useReportHelper = ()=> {
    const ipcRenderer = useContext(GlobalContext).ipcRenderer

    const makeReport = (salesList, lossList, goodsList, dateNow, dateAsOf,option,path,username,breakDown,trCount)=> {
        const left = AlignmentType.LEFT
        const right = AlignmentType.RIGHT
        const center = AlignmentType.CENTER
        const isAnnual = option === 'Annual'

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        pageNumbers: {
                            start: 1,
                            formatType: NumberFormat.DECIMAL,
                        },
                    },
                },footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    new TextRun({
                                        children: [PageNumber.CURRENT],
                                    }),
                                    new TextRun({
                                        children: [' of ', PageNumber.TOTAL_PAGES],
                                    }),
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [
                                    new TextRun({
                                        text: `Printed Date & Time: ${dateNow}`
                                    })
                                ]
                            })
                        ],
                    }),
                },
                children: [
                    oneLineParagraph('HLC Grocery',72,true, center),
                    oneLineParagraph('#01 Sto. Ñino Street Payatas A. Quezon City',28,false, center),
                    lineBreak(5),
                    oneLineParagraph(option + ' Report Summary',56,false, center),
                    oneLineParagraph(`As of ${dateAsOf}`,40, false,center),
                    lineBreak(3),
                    oneLineParagraph('Sales',40,true, left),
                    lineBreak(1),
                    salesSummaryTable(salesList,center, right),
                    lineBreak(1),
                    oneLineParagraph('Inventory Loss',40,true, left),
                    lineBreak(1),
                    inventoryLossSummaryTable(lossList,center,right),
                    lineBreak(1),
                    oneLineParagraph('Goods Receipt',40,true, left),
                    lineBreak(1),
                    goodsReceiptSummaryTable(goodsList, center, right),
                    isAnnual ? new Paragraph({pageBreakBefore:true}) : lineBreak(0),
                    isAnnual ? oneLineParagraph('Monthly Sales',40,true, left): lineBreak(0),
                    isAnnual ? lineBreak(1): lineBreak(0),
                    isAnnual ? annualBreakDown(breakDown,center,right) : lineBreak(0),
                    new Paragraph({pageBreakBefore:true}),
                    oneLineParagraph(`${option} Sales Report`,40,true,center),
                    lineBreak(1),
                    salesProductReportTable(salesList,trCount),
                    new Paragraph({pageBreakBefore:true}),
                    oneLineParagraph(`${option} Inventory Loss Report`,40,true,center),
                    lineBreak(1),
                    inventoryLossProductReportTable(lossList),
                    new Paragraph({pageBreakBefore:true}),
                    oneLineParagraph(`${option} Goods Receipt Report`,40,true,center),
                    lineBreak(1),
                    goodsReceiptProductReportTable(goodsList),
                    lineBreak(10),
                    setMeta()
                ],
            }],
        })
        Packer.toBuffer(doc).then((buffer) => {
            const filePath = `${path}\\Report-${username}-${dateNow.replaceAll(' ','-').replaceAll(':','-')}.docx`
            fs.writeFile(filePath, buffer,"utf-8",(e)=> {
                if(e) console.log(e)
                ipcRenderer.send('showMessage','Export',`Success: file saved to ${filePath}`)
            })
        })
    }

    const setMeta = ()=> {
        return new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({
                    text: 'Prepared By:',
                    bold: true,
                    size: 28,
                }),
                new TextRun({
                    break: 3
                }),
                new TextRun({
                    text: '________________',
                    bold: true,
                    size: 28,
                    underline: {
                        type: UnderlineType.SINGLE,
                        color: '000000'
                    }
                }),
                new TextRun({
                    break: 1
                }),
                new TextRun({
                    text: '\tOwner',
                    bold: true,
                    size: 28,
                })
            ]
        })
    }

    const oneLineParagraph = (text, size, isBold, alignment)=> {
        return new Paragraph({
            children: [new TextRun({
                text: text,
                bold: isBold,
                size: size,

            })],
            alignment: alignment,
        })
    }

    const lineBreak = (num)=> {
        return new Paragraph({
            children: [
                new TextRun({
                    break: num
                }),
            ]
        })
    }

    const newTableCell = (text,width,alignment)=> {
        return new TableCell({
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: text,
                            size: 24
                        })
                    ],
                    alignment: alignment
                })
            ],
            width: {
                size: width,
                type: WidthType.PERCENTAGE
            }
        })
    }

    const salesSummaryTable = (salesList, center, right)=> {
        const summary = calculateSalesSummary(salesList)
        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: [
                new TableRow({
                    children: [
                        newTableCell('Total Sales',30, center),
                        newTableCell(`\u20B1 ${fixNumber(summary[0])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('Total Item Sold',30, center),
                        newTableCell(`${summary[1].toLocaleString()}`,70, right),
                    ]
                })
            ]
        })
    }

    const inventoryLossSummaryTable = (void_p,center,right)=> {
        const summary = calculateInventoryLossSummary(void_p)
        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: [
                new TableRow({
                    children: [
                        newTableCell('Total Expired Items',30, center),
                        newTableCell(`${summary[0].toLocaleString()}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('Total Damaged Items',30, center),
                        newTableCell(`${summary[1].toLocaleString()}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('Total Quantity',30, center),
                        newTableCell(`${summary[3].toLocaleString()}`,70, right),
                    ]
                }),
            ]
        })
    }

    const goodsReceiptSummaryTable = (goodsList, center, right) => {
        const summary = calculateGoodsReceiptSummary(goodsList);
        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: [
                new TableRow({
                    children: [
                        newTableCell('Total Product Delivered',30, center),
                        newTableCell(`${summary[0].toLocaleString()}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('Total Quantity',30, center),
                        newTableCell(`${summary[1].toLocaleString()}`,70, right),
                    ]
                })
            ]
        })
    }

    function calculateSalesSummary(salesList) {
        const [salesTotal, salesQuantity] = salesList.reduce((acc, cur) => {
            const total = add(acc[0], cur.total)
            const quantity = add(acc[1], cur.quantity)
            return [total, quantity]
        }, [0, 0])

        return [salesTotal, salesQuantity]
    }

    const calculateInventoryLossSummary = (lossList)=> {
        let expired = 0
        let damaged = 0
        let cost = 0
        for(let i in lossList) {
            if(lossList[i]['reason'] === 'Damaged') damaged = add(damaged,lossList[i]['quantity'])
            else expired = add(expired,lossList[i]['quantity'])
            cost = add(cost,lossList[i]['total'])
        }
        return [expired, damaged, cost, add(expired,damaged)]
    }

    const calculateGoodsReceiptSummary = (goodsList) => {
        const list = []
        let quantity = 0
        for(let i in goodsList) {
            quantity = add(quantity,goodsList[i]['quantity'])
            if(!list.includes(goodsList[i]['id'])) list.push(goodsList[i]['id'])
        }
        if(goodsList.length < 1) quantity = 0
        return [list.length, quantity]
    }

    const annualBreakDown = (breakDown,center,right)=> {
        return  new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: [
                new TableRow({
                    children: [
                        newTableCell('January',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[0])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('February',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[1])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('March',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[2])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('April',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[3])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('May',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[4])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('June',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[5])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('July',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[6])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('August',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[7])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('September',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[8])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('October',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[9])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('November',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[10])}`,70, right),
                    ]
                }),
                new TableRow({
                    children: [
                        newTableCell('December',30, center),
                        newTableCell(`\u20B1 ${fixNumber(breakDown[11])}`,70, right),
                    ]
                }),
            ]
        })
    }

    const salesProductReportTable = (salesList, trCount) => {
        const table = createTable(createTableRow(['Id','Description','Price','Qty','Disc','Total'],true))
        const summary = calculateSalesSummary(salesList)
        for(let i in salesList) {
            const arr = []
            arr.push(salesList[i]['id'])
            arr.push(salesList[i]['name'])
            arr.push(`\u20B1 ${fixNumber(salesList[i]['price'])}`)
            arr.push(salesList[i]['quantity'].toLocaleString())
            arr.push(`${salesList[i]['discount']} %`)
            arr.push(`\u20B1 ${fixNumber(salesList[i]['total'])}`)
            table.root.push(createTableRow(arr,false))
        }
        table.root.push(
            new TableRow({
                children: [
                    createTableCellSpan(`Total Transaction: ${trCount.toLocaleString()}`,5,32),
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `\u20B1 ${fixNumber(summary[0])}`,
                                        bold: true,
                                        size: 32
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        )
        return table
    }

    const inventoryLossProductReportTable = (lossList)=> {
        const table = createTable(createTableRow(['Id','Description','Reason','Qty'],true))
        const summary = calculateInventoryLossSummary(lossList)
        for(let i in lossList) {
            const arr = []
            arr.push(lossList[i]['id'])
            arr.push(lossList[i]['name'])
            arr.push(lossList[i]['reason'])
            arr.push(lossList[i]['quantity'].toLocaleString())
            table.root.push(createTableRow(arr,false))
        }
        table.root.push(
            new TableRow({
                children: [
                    createTableCellSpan(`Total Expired: ${summary[0].toLocaleString()}\tTotal Damaged: ${summary[1].toLocaleString()}`,3,32),
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `Total: ${summary[3]}`,
                                        bold: true,
                                        size: 32
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        )
        return table
    }

    const goodsReceiptProductReportTable = (goodsList) => {
        const table = createTable(createTableRow(['Id','Description','Price','Qty'],true))
        const summary = calculateGoodsReceiptSummary(goodsList)
        for(let i in goodsList) {
            const arr = []
            arr.push(goodsList[i]['id'])
            arr.push(goodsList[i]['name'])
            arr.push(`\u20B1 ${fixNumber(goodsList[i]['price'])}`)
            arr.push(goodsList[i]['quantity'].toLocaleString())
            table.root.push(createTableRow(arr,false))
        }
        table.root.push(
            new TableRow({
                children: [
                    createTableCellSpan(`Total Product: ${summary[0].toLocaleString()}\tTotal Qty: ${summary[1].toLocaleString()}`,4,32),
                ]
            })
        )
        return table
    }

    const createTable = (header)=> {
        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: [header]
        })
    }

    function createTableRow(data,isHeader) {
        const cellList = []
        for(let i in data) {
            cellList.push(
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: data[i],
                                    size: isHeader ? 32 : 24,
                                    bold: isHeader
                                })
                            ],
                            alignment: AlignmentType.CENTER
                        })
                    ],
                    width: {
                        size: data[i].length + 5,
                        type: WidthType.NIL
                    }
                })
            )
        }
        return new TableRow({
            children: cellList,
            tableHeader: isHeader,
            cantSplit: true,
        })
    }

    function createTableCellSpan(text,span,size) {
        return new TableCell({
            children:[
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: text,
                            size: size,
                            bold: true
                        })
                    ]
                })
            ],
            columnSpan: span
        })
    }

    return {
        make: makeReport
    }
}
