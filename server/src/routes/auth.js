import express from 'express';
import { X509WalletMixin } from 'fabric-network';
import { getCA, getConnectedWallet, registerUser } from '../utils';

const router = express.Router();
const registrationAffilation = async (req, res, affilation) => {
  const { login, password } = req.body;
  try {
    const ca = getCA();
    const adminData = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'password' });
    const mixin = X509WalletMixin.createIdentity(
      'Org1MSP',
      adminData.certificate,
      adminData.key.toBytes()
    );
    const gateway = await getConnectedWallet('Org1MSP', mixin);
    const admin = await gateway.getCurrentIdentity()
    await registerUser( ca, admin, { login, password, affiliation: affilation });

    const userData = await ca.enroll({
      enrollmentID: login,
      enrollmentSecret: password,
    });
    gateway.disconnect();
    res.status(201).json({
      login,
      certificate: userData.certificate,
      privateKey: userData.key.toBytes(),
    });
  }
  catch (err) {
    if (typeof err === "string")
      res.status(400).json(
          {
            "message": err
          }
      )
    else {
      res.status(400).json(
          {
            "message": "Server error",
            "error": err
          }
      )
    }
  }
};

const teacherRegistration = async (req, res) => {
  return registrationAffilation(req, res, "teacher")
}
const studentRegistration = async (req, res) => {
  return registrationAffilation(req, res, "student")
}

router.post('/student', studentRegistration);
router.post('/teacher', teacherRegistration);

export default router;
