# bip4cast

bip4cast is a web app based on node.js to manage a psychiatric hospital, specifically to work with bipolar disorder patients. This web app is part of bip4cast ecosystem, which is also composed of an Android app (installed in the patient's smartphone) and an actigraph weared by the patient 24/7.

With this app the doctor can:
* Store phenotypical data of each patient.
* Prescribe medicines, edit and delete them.
* Store by date this test:
    * GAF (_Global Assessment of Functioning_.
    * HDRS (_Hamilton Depression Rating Scale_).
    * YMRS (_Young Mania Rating Scale_).
    * PANSS (_Positive and Negative Syndrome Scale_).
* Send messages to patients (this messages will be displayed in the patient's Android app).

Also, all stored data can be displayed to analyse and compare them. The data visualization part lets the psychiatrist determine patient's evolution and status, and also compare data between patients.

This app is entirely in Spanish (translations will be welcomed!). More info in [bip4cast web](http://www.bip4cast.org).

## Development status
- [x] Basic medical office management (patient's data, medical test, prescriptions, communication).
- [ ] Testing (_we're now on this!_).
- [ ] Data visualization.

## License
Code published under GNU General Public License (GNU-GPL) v3 (see [LICENSE](https://github.com/davidpgomez/bip4cast/blob/master/LICENSE)).