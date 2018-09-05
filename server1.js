const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({
	extended: false
});
const dataFileName = 'data.json'
const initialDataFileName = 'initialData.json'
const encoding = 'utf8'




function readFileData() {
	let file_reader = fs.readFileSync(dataFileName, encoding);
	if (file_reader) {
		return JSON.parse(file_reader);
	} else {
		var data = prepareDefultData();
		writeFileData(data);
		return data;
	}
}

function writeFileData(data) {
	fs.writeFileSync(dataFileName, JSON.stringify(data), encoding);
}

function prepareDefultData() {
	let file_reader = fs.readFileSync(initialDataFileName, encoding);
	return JSON.parse(file_reader);
}

app.get('/getGlobal', function (req, res) {
	var data = readFileData();
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
	res.send(JSON.stringify(data.faculties));
});

app.get('/getNote', function (req, res) {
	console.log(req.query)
	var data = readFileData();
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
	let courseData = data.students[req.query.facult][req.query.spec][req.query.course];
	let note = {};
	for (let stud in courseData) {
		let mark = courseData[stud][req.query.subj];
		note[stud] = mark === undefined ? null : mark;
	}

	res.send(JSON.stringify(note));
});

app.post('/setMark', urlencodedParser, function (req, res) {
	console.log(req.body)
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
	let data = readFileData();

	if (
		data &&
		data.students &&
		data.students[req.body.facult] &&
		data.students[req.body.facult][req.body.spec] &&
		data.students[req.body.facult][req.body.spec][req.body.course] &&
		data.students[req.body.facult][req.body.spec][req.body.course][req.body.student]
	) {
		let studentData = data.students[req.body.facult][req.body.spec][req.body.course][req.body.student];
		let subject = req.body.subj;
		let subjects = data.faculties[req.body.facult][req.body.spec][req.body.course];
		if (subjects.includes(subject)) {
			studentData[subject] = req.body.mark;
		} else {
			console.log('Такого предмета немає');
		}

		writeFileData(data);
		res.send(JSON.stringify(studentData));
	} else {
		let errorMsg = 'Не відповідність даних(дані на сервері або параметр факультет, спеціальність, курс, студент)';
		console.error(errorMsg);
		res.status(500).send(JSON.stringify(errorMsg));
	}
});
app.post('/addStud', urlencodedParser, function (req, res) {
	console.log(req.body)
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
	let data = readFileData();
	data.students[req.body.facult][req.body.spec][req.body.course][req.body.newStud] = {};

	writeFileData(data);
	res.send(JSON.stringify((data.students[req.body.facult][req.body.spec][req.body.course][req.body.newStud] = {})));
});

app.post('/deleteStud', urlencodedParser, function (req, res) {
	console.log(req.body)
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
	let data = readFileData();
	let courseStudents = data.students[req.body.facult][req.body.spec][req.body.course];
	for (let stud in courseStudents) {

		if (stud === req.body.stud) {
			delete courseStudents[stud];
		}

	}

	writeFileData(data);
	res.send(JSON.stringify(courseStudents));
});

app.post('/retake', urlencodedParser, function (req, res) {
	console.log(req.body)
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
	let data = readFileData();
	let retakeInfo = [];

	let students = data.students;
	for (let f in students) {
		let facultCounter = 1;
		for (let s in students[f]) {
			for (let c in students[f][s]) {
				studObj = students[f][s][c];
				for (let student in studObj) {
					let subjectsPassed = studObj[student];
					for (let subj in subjectsPassed) {
						let marks = subjectsPassed[subj];
						if (marks.includes('Незадовільно')) {
							retakeInfo.push({
								student,
								subj,
								f,
								s,
								facultCounter
							});
							facultCounter++;


						}
					}
				}
			}
		}
	}

	res.send(JSON.stringify(retakeInfo));
});

app.listen(3000, 'localhost');