class PrintForm {
    constructor(data) {
        this.printForm = window.open('','PRINT')
        this.larStatus = data.larStatus
        this.detail = data.detail
    }

    preparing() {
        this.printForm.document.write(`
            <meta http-equiv="Cache-Control" content="no-store">
            <meta charset="UTF-8"
            <html>
                <head><title>เอกสารการลา</title>
                <link rel="stylesheet" type="text/css" href="../public/css/bootstrap.min.css">
                <link rel="stylesheet" type="text/css" href="../public/css/printlarform.css">
                <link rel="stylesheet" href='https://fonts.googleapis.com/css2?family=Sarabun&display=swap'>
                </head>
                <body class="page-a4">
                    ${this.bodyContent()}
                </body>
            </html>
        `)
    }

    bodyContent() {
        let paperPage = document.createElement('div')
        let content = document.createElement('div')
        let topPage = this.topHeader()
        let head = this.contentHeader()
        let detailHead = this.detailHeader()

        paperPage.classList.add('contents')
        content.classList.add('inner-content')

        paperPage.appendChild(topPage)
        content.appendChild(head)
        content.appendChild(detailHead)

        paperPage.appendChild(content)

        return paperPage.outerHTML
    }

    topHeader() {
        let headerContain = document.createElement('div')
        let docNumber = document.createElement('div')
        let logo = document.createElement('img')

        headerContain.classList.add('position-relative')
        docNumber.classList.add('text-muted','position-absolute','document-number')
        logo.classList.add('logo','position-absolute')

        docNumber.textContent = 'FM-HR-01-19'
        logo.setAttribute('src','public/img/logosmall.jpg')
        headerContain.appendChild(docNumber)
        headerContain.appendChild(logo)
        return headerContain
    }

    contentHeader() {
        let title = document.createElement('div')
        let titleText = document.createElement('h5')        

        titleText.classList.add('text-center')
        titleText.textContent = 'แบบใบลา (ใช้ควบคู่กับการลาในระบบ)'

        title.appendChild(titleText)

        return title
    }

    detailHeader() {
        let lineSpace = document.createElement('div')
        lineSpace.classList.add('mt-3')

        let detailContent = document.createElement('div')
        detailContent.classList.add('text-content-font')

        let flexContent = document.createElement('div')
        flexContent.classList.add('d-flex')

        let flexContent2 = document.createElement('div')
        flexContent2.classList.add('d-flex')

        let flexContent3 = document.createElement('div')
        flexContent3.classList.add('d-flex')

        let sectionLeft = document.createElement('div')
        sectionLeft.classList.add('border-round','w-75')

        let sectionRight = document.createElement('div')
        sectionRight.classList.add('ml-2')

        let contentTo = document.createElement('p')
        contentTo.textContent = "เรียน ฝ่ายบริหารทรัพยากรบุคคล"

        let contentName = document.createElement('p')
        contentName.classList.add('indent-first') 
        contentName.textContent = "ข้าพเจ้า นาย/นาง/นางสาว"

        let inputName = document.createElement('p')
        inputName.classList.add('bottom-dotted','text-center','flex-fill')
        inputName.setAttribute('contenteditable',true)
        inputName.textContent = this.detail.fullname

        let contentJob = document.createElement('p')
        contentJob.textContent = "ตำแหน่ง"

        let inputJob = document.createElement('p')
        inputJob.classList.add('bottom-dotted','text-center','flex-fill')
        inputJob.setAttribute('contenteditable',true)
        inputJob.textContent = this.detail.job

        let contentDep = document.createElement('p')
        contentDep.textContent = "สังกัด/ฝ่าย"

        let inputDep = document.createElement('p')
        inputDep.classList.add('bottom-dotted','text-center','flex-fill')
        inputDep.setAttribute('contenteditable',true)
        inputDep.textContent = this.detail.depart

        let larType = document.createElement('p')
        larType.classList.add('legend','flex-nowrap')
        larType.textContent = "มีความประสงค์จะขอลา"

        let larList = this.larList()
        let detailOther = this.detailOther()

        detailContent.appendChild(contentTo)

        flexContent.appendChild(contentName)
        flexContent.appendChild(inputName)
        detailContent.appendChild(flexContent)

        flexContent2.appendChild(contentJob)
        flexContent2.appendChild(inputJob)
        flexContent2.appendChild(contentDep)
        flexContent2.appendChild(inputDep)
        detailContent.appendChild(flexContent2)

        sectionLeft.appendChild(larType)
        sectionLeft.appendChild(larList)
        sectionRight.appendChild(detailOther)
        flexContent3.appendChild(sectionLeft)
        flexContent3.appendChild(sectionRight)
        detailContent.appendChild(flexContent3)

        lineSpace.appendChild(detailContent)

        return lineSpace
    }

    larList() {
        const larList = ['ลาป่วย','ลากิจ','ลาพักร้อน','ลาคลอด','อื่นๆ']
        const lartype = this.detail.lartype
        const elementContent = document.createElement('div')
        let typeUsed = false
        for (let type of larList) {
            let labelElement = document.createElement('label')
            labelElement.classList.add('radio-square')
            let inputElement = document.createElement('input')
            inputElement.setAttribute("type","radio")
            inputElement.setAttribute("name","radio")
            let spanElement = document.createElement('span')
            spanElement.classList.add('d-flex')
            spanElement.textContent = type
            let otherElement = document.createElement('div')
            otherElement.classList.add('bottom-dotted','flex-fill')
            otherElement.setAttribute("contenteditable",true)
            otherElement.textContent = type
            
            if (type == lartype) { 
                inputElement.setAttribute("checked",true); 
                typeUsed = true 
            }
            if (type == "อื่นๆ") {
                spanElement.innerHTML = otherElement.outerHTML        
            }
            if (!typeUsed && type == "อื่นๆ") { 
                inputElement.setAttribute("checked",true);
                otherElement.textContent = lartype
            }

            labelElement.appendChild(inputElement)
            labelElement.appendChild(spanElement)            
            elementContent.appendChild(labelElement)
        }
        return elementContent
    }

    detailOther() {
        let detail = this.detail
        let element = document.createElement('div')
        let flexElement = document.createElement('div')
        flexElement.classList.add('d-flex','flex-wrap')
        let flexElement2 = document.createElement('div')
        flexElement.classList.add('d-flex','flex-wrap')
        const text = (value) => {
            let textElement = document.createElement('p')
            textElement.textContent = value
            return textElement
        }
        const textField = (value) => {
            let inputElement = document.createElement('p')
            inputElement.classList.add('bottom-dotted','text-center','flex-fill')
            inputElement.setAttribute('contenteditable',true)
            inputElement.textContent = value
            return inputElement
        }
        const newLine = () => {
            let newlineElement = document.createElement('div')
            newlineElement.classList.add('flex-break')
            return newlineElement
        }

        flexElement.appendChild(text('เนื่องจาก'))
        flexElement.appendChild(textField(detail.detail))
        flexElement.appendChild(text('ตั้งแต่ วันที่'))
        flexElement.appendChild(textField(detail.sdate))
        flexElement.appendChild(text('ถึงวันที่'))
        flexElement.appendChild(textField(detail.edate))
        if (detail.stime == '-') {
            flexElement.appendChild(text('มีกำหนด'))
            flexElement.appendChild(textField(detail.duration))
        } else {
            flexElement.appendChild(text('ตั้งแต่เวลา'))
            flexElement.appendChild(textField(detail.stime))
            flexElement.appendChild(text('ถึง'))
            flexElement.appendChild(textField(detail.etime))
            flexElement.appendChild(text('จำนวน'))
            flexElement.appendChild(textField(detail.duration))
        }
        flexElement.appendChild(text('ในระหว่างที่ข้าพเจ้าลา บริษัทฯ สามารถติดต่อข้าพเจ้าได้ที่'))
        //flexElement.appendChild(text('ในระหว่างที่ข้าพเจ้าลา บริษัทฯ สามารถติดต่อข้าพเจ้าได้ที่'))
        flexElement2.appendChild(textField(''))
        element.appendChild(flexElement)
        element.appendChild(flexElement2)

        return element
    }
}