'use strict';

const {Contract} = require('fabric-contract-api');
const {ClientIdentity} = require('fabric-shim');

class StudentRecordsStorage extends Contract {
    constructor() {
        super('org.fabric.studentRecordsStorage');
    }

    async createSubjectToRecord(ctx, studentEmail, fullName) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'teacher') {
            throw new Error('Current subject has no access to this function')
        }
        const recordAsBytes = await ctx.stub.getState(studentEmail);

        if (!!recordAsBytes && recordAsBytes.length !== 0) {
            throw new Error("This student already exists")
        }
        const newRecord = {
            fullName,
            semesters: [],
        }
        await ctx.stub.putState(studentEmail, Buffer.from(JSON.stringify(newRecord)))
        return JSON.stringify(newRecord, null, 2);
    }

    async addSubjectToStudentRecord(ctx, studentEmail, semesterNumber, subjectName) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'teacher') {
            throw new Error('Current subject has no access to this function')
        }
        const recordAsBytes = await ctx.stub.getState(studentEmail);

        if (recordAsBytes.length === 0) {
            throw new Error("This student does not exist")
        }
        const recordAsObject = JSON.parse(recordAsBytes.toString());
        if (recordAsObject.semesters[semesterNumber]) {
            if (recordAsObject.semesters[semesterNumber][subjectName]) {
                throw new Error("This student already has this subject")
            } else
                recordAsObject.semesters[semesterNumber][subjectName] = {
                    lector: identity.cert.subject.commonName,
                    themes: []
                }
        } else
            recordAsObject.semesters[semesterNumber] = {
                [subjectName]: {
                    lector: identity.cert.subject.commonName,
                    themes: []
                }
            }


        await ctx.stub.putState(studentEmail, Buffer.from(JSON.stringify(recordAsObject)))
        return JSON.stringify(recordAsObject, null, 2);
    }

    async addGradeToStudentRecord(ctx, studentEmail, semesterNumber, subjectName, themeName, grade) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'teacher') {
            throw new Error('Current subject has no access to this function')
        }
        const recordAsBytes = await ctx.stub.getState(studentEmail);

        if (recordAsBytes.length === 0) {
            throw new Error("This student does not exist")
        }
        const recordAsObject = JSON.parse(recordAsBytes.toString());

        if (recordAsObject.semesters[semesterNumber]) {
            if (recordAsObject.semesters[semesterNumber][subjectName]) {
                recordAsObject.semesters[semesterNumber][subjectName]["themes"].push({
                    title: themeName,
                    rating: grade,
                    date: ctx.stub.getTxTimestamp().seconds.low
                })
            } else {
                throw new Error("This student is not enrolled in this subject")
            }
        } else {
            throw new Error("This subject does not exist in this semester")
        }


        await ctx.stub.putState(studentEmail, Buffer.from(JSON.stringify(recordAsObject)))

        return JSON.stringify(recordAsObject, null, 2);
    }

    async getStudentRecords(ctx, studentEmail) {
        const recordAsBytes = await ctx.stub.getState(studentEmail);

        if (recordAsBytes.length === 0) {
            throw new Error("This student does not exist")
        }
        const recordAsObject = JSON.parse(recordAsBytes.toString())
        return JSON.stringify(recordAsObject.semesters, null, 2);
    }

    async getStudentRecordsBySemester(ctx, studentEmail, semesterNumber) {
        const recordAsBytes = await ctx.stub.getState(studentEmail);

        if (recordAsBytes.length === 0) {
            throw new Error("This student does not exist")
        }
        const recordAsObject = JSON.parse(recordAsBytes.toString())
        return JSON.stringify(recordAsObject.semesters[semesterNumber] || [], null, 2);
    }

    async getTeacherSubjects(ctx) {
        const iterator = await ctx.stub.getStateByRange("", "");
        let result = [];
        const identity = new ClientIdentity(ctx.stub);

        while (true) {
            let res = await iterator.next();

            if (res.done) {
                await iterator.close();
                return JSON.stringify(result, null, 2);
            } else {
                let record;
                try {
                    record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    record = res.value.value.toString('utf8');
                }
                for (let i = 0; i < record.semesters.length; i++) {
                    for (let subjectName in record.semesters[i]) {
                        //if teacher is leading this subject
                        if (record.semesters[i][subjectName].lector === identity.cert.subject.commonName) {
                            let themes = []
                            //lit all themes
                            for (let theme of record.semesters[i][subjectName].themes) {
                                themes.push(theme.title)
                            }
                            //if semester exists
                            if (result[i]) {
                                //if subject exists
                                if (result[i][subjectName]) {
                                    result[i][subjectName] = {
                                        themes: themes.concat(result[i][subjectName].themes.filter((item) => themes.indexOf(item) < 0))
                                    }
                                }
                                //subject does not exist
                                else {
                                    result[i] = {
                                        [subjectName]: {
                                            themes
                                        }
                                    }
                                }
                            }
                            //semester does not exist; add semester with themes
                            else {
                                result[i] = {
                                    [subjectName]: {
                                        themes,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async getStudentsForSubject(ctx, subjectName, semester) {
        const iterator = await ctx.stub.getStateByRange("", "");
        let result = [];

        while (true) {
            let res = await iterator.next();

            if (res.done) {
                await iterator.close();
                return JSON.stringify(result, null, 2);
            } else {
                let record;
                try {
                    record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    record = res.value.value.toString('utf8');
                }
                if (record.semesters[semester][subjectName]) {
                    result.push({
                        student: res.value.key.toString('utf8'),
                        themes: record.semesters[semester][subjectName].themes
                    })
                }
            }
        }
    }
}

module.exports = StudentRecordsStorage;
