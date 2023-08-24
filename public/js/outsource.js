$('.datepicker input').datepicker({
    ignoreReadonly: true,
    format: 'dd/mm/yyyy',
    todayHighlight: true
})

$('.datepickera').datepicker('setDate',moment().startOf('month').format("DD/MM/YYYY"))
$('.datepickerb').datepicker('setDate',moment().endOf('month').format("DD/MM/YYYY"))

// DateRange Type Select

$('.datepickera').datepicker().on('changeDate',function(e){
 $('.datepickera').datepicker('hide')
 $('.datepickerb').datepicker('show')
})

$('.datepickerb').datepicker().on('changeDate',function(e){
 $('.datepickerb').datepicker('hide')
})

$(document).on('click','#submit',() => {
    let id = $('#userid').val();
    let stime = $('.datepickera').datepicker('getDate').getTime();
    let etime = $('.datepickerb').datepicker('getDate').getTime();
    data = {
        id: id,
        stime: moment(stime).format("YYYY/MM/DD"),
        etime: moment(etime).add(1,'d').format("YYYY/MM/DD")
    }
    $.ajax({
        url: '/outsource',
        type: 'POST',
        dataType: "json",
        async: false,
        data: data,
        success: function (data) {
            console.log(data);
            let report = new createReport(data);
            report.generate();
        }
    })
})

class createReport {
    constructor(data) {;
        this.id = data.id
        this.fullname = data.fullname;
        this.timelist = data.timelist;
        this.datestart = data.datestart;
        this.dateend = data.dateend;
        this.start = moment(data.datestart,'YYYY/MM/DD').locale('th').format('DD MMM YYYY');
        this.end = moment(data.dateend,'YYYY/MM/DD').locale('th').format('DD MMM YYYY');
    }

    generate() {
        let table = document.getElementById('report');
        let thead = this.header();
        let tbody = this.body();

        table.innerHTML = "";
        table.appendChild(thead);
        table.appendChild(tbody);
    }

    header() {
        let thead = document.createElement('thead');
        let fixWidth = document.createElement('tr');
        let firstline = document.createElement('tr');
        let secondline = document.createElement('tr');
        let thirdline = document.createElement('tr');
        let title = document.createElement('tr');
        
        let fle = document.createElement('td');
        let sle = document.createElement('td');
        let tle1 = document.createElement('td');
        let tle2 = document.createElement('td');
        let tle3 = document.createElement('td');
        let tle4 = document.createElement('td');
        let tt1 = document.createElement('td');
        let tt2 = document.createElement('td');
        let tt3 = document.createElement('td');
        let tt4 = document.createElement('td');

        fixWidth = this.trBlank(17);

        thead.classList.add('head-top');
        fle.classList.add('title-top');
        fle.setAttribute('colspan','17');
        fle.innerHTML = "รายงานแสดงเวลาของพนักงาน";
        firstline.appendChild(fle);

        sle.classList.add('date-top');
        sle.setAttribute('colspan','17');
        sle.innerHTML = `${this.start} ถึง ${this.end}`;
        secondline.appendChild(sle);

        tle1.setAttribute('colspan','1');
        tle2.setAttribute('colspan','7');
        tle3.setAttribute('colspan','5');
        tle4.setAttribute('colspan','4');
        tle2.innerHTML = `ชื่อสกุล: ${this.fullname}`;
        tle4.innerHTML = `รหัสพนักงาน: ${this.id}`;
        thirdline.appendChild(tle1);
        thirdline.appendChild(tle2);
        thirdline.appendChild(tle3);
        thirdline.appendChild(tle4);

        title.classList.add('title-head');
        tt1.setAttribute('colspan','1');
        tt2.setAttribute('colspan','2');
        tt3.setAttribute('colspan','3');
        tt4.setAttribute('colspan','11');
        tt2.innerHTML = "วันที่";
        tt4.innerHTML = "เวลา";
        title.appendChild(tt1);
        title.appendChild(tt2);
        title.appendChild(tt3);
        title.appendChild(tt4);
        
        thead.appendChild(fixWidth);
        thead.appendChild(firstline);
        thead.appendChild(secondline);
        thead.appendChild(thirdline);
        thead.appendChild(title);

        return thead;
    }

    body() {
        let tbody = document.createElement('tbody')
        let begin = moment(this.datestart,'YYYY/MM/DD').subtract(1,'d');
        let finish = moment(this.dateend,'YYYY/MM/DD');
        let last = finish.diff(begin,'d');
        for (let current=0; current<last; current++) {
            let currentDate = begin.add(1,'d').format('DD/MM/YYYY');
            tbody.appendChild(this.content(currentDate));
        };
        return tbody
    }

    content(date) {
        let time = this.timelist[date];
        if (!time) return this.addTime(date,0);
        return this.addTime(date,time);
    }

    trBlank(col) {
        let fixWidth = document.createElement('tr')
        for (let i=1;i<=col;i++) {
            let td = document.createElement('td');
            fixWidth.appendChild(td);
        }
        return fixWidth;
    }

    addTime(date, time) {
        let element = document.createElement('tr');
        let dateMargin = document.createElement('td');
        let dateCell = document.createElement('td');
        let dateTime = document.createElement('td');
        element.classList.add('date-line');
        dateMargin.setAttribute("colspan","1");
        dateCell.setAttribute('colspan','5');
        dateTime.setAttribute('colspan','11')
        dateCell.innerHTML = date;
        element.appendChild(dateMargin);
        element.appendChild(dateCell);
        if (!time) { 
            element.appendChild(dateTime)
            return element
        };
        let count = time.length;
        if (count>8) time = this.removeOver(time,count);
        time.forEach(t => {
           let td = document.createElement('td');
           td.innerHTML = t;
           element.appendChild(td); 
        });
        return element;
    }

    removeOver(time,count) {
        let length = count-8;
        let start = count-((count/2)+Math.floor((length)/2));
        return time.shift(start,length);
    }   
}