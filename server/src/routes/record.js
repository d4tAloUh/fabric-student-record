import express from 'express';
import { X509WalletMixin } from 'fabric-network';
import {getConnectedWallet, sendTransaction} from '../utils';

const router = express.Router();
const createStudentRecord = async (req, res) => {
    const {certificate,privateKey, studentEmail, studentFullName} = req.body
    try {
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway,{
            name:"createSubjectToRecord",
            props:[studentEmail,studentFullName],
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const addSubjectToStudentRecord = async (req, res) => {
    const {certificate,privateKey,studentEmail, semesterNumber, subjectName} = req.body
    try {
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway,{
            name:"addSubjectToStudentRecord",
            props:[studentEmail,semesterNumber,subjectName],
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const addGradeToStudentRecord = async (req, res) => {
    const {certificate,privateKey,studentEmail, semesterNumber, subjectName,themeName,grade} = req.body
    try {
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway,{
            name:"addGradeToStudentRecord",
            props:[studentEmail, semesterNumber, subjectName,themeName,grade],
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const getStudentRecords = async (req, res) => {
    const {certificate,privateKey,studentEmail} = req.body
    try {
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway,{
            name:"getStudentRecords",
            props:[studentEmail],
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const getStudentRecordsBySemester = async (req, res) => {
    const {certificate,privateKey,studentEmail,semesterNumber} = req.body
    try {
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway,{
            name:"getStudentRecordsBySemester",
            props:[studentEmail,semesterNumber],
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const getTeacherSubjects = async (req, res) => {
    const {certificate,privateKey} = req.body
    try {
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway,{
            name:"getTeacherSubjects",
            props:[],
        })
        console.log(result)
        gateway.disconnect()
        res.status(201).json({data: result})
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const getEachStudentRecordForSubject = async (req, res) => {
    const {certificate,privateKey,subjectName, semester} = req.body
    try {
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            certificate,
            privateKey
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway,{
            name:"getStudentsForSubject",
            props:[subjectName, semester],
        })
        console.log(result)
        gateway.disconnect()
        res.status(201).json({data: result})
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};

router.post('/create', createStudentRecord);
router.post('/subject/create', addSubjectToStudentRecord);
router.post('/grade/create', addGradeToStudentRecord);
router.get('/', getStudentRecords);
router.get('/semester', getStudentRecordsBySemester);
router.get('/teacher', getTeacherSubjects);
router.get('/teacher/subject', getEachStudentRecordForSubject);

export default router;
