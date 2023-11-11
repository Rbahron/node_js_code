const mongoose = require('mongoose');
const currensy = require('currency.js');
const initdatabase = require('./init');
const user = require('./moduls/user');
const journal = require('./moduls/journal');


async function transferMoney(senderAccountNumber, receiverAccountNumber, amount) {

    await initdatabase();


    const session = await mongoose.startSession();


    session.startTransaction();


    try {
        let sender = await User.findOne({ accountNumber: senderAccountNumber }).session(session);
        if (!sender)
            throw new Error('Sender not found');


        sender.balance = currensy(sender.balance).subtract(amount);


        if (sender.balance < 0) {
            throw new Error('User - ${sender.name} has insufficient founds');

        }

        await sender.save();

        let debitJournal = new Journal({
            accountNumber: sender.accountNumber, operation: 'Debit', amount: amount
        })

        await debitJournal.save();

        receiver.balance = await User.findOne({ accountNumber: receiverAccountNumber }).session(session);

        receiver.balance = currensy(receiver.balance).add(amount);
        await receiver.save();

        let creditJournal = new Journal({
            accountNumber: receiver.accountNumber, operation: 'Credit', amount: amount
        })

        await creditJournal.save();

        await session.commitTransaction();

        console.log('Transaction has been completed successfully!');

    } catch (error) {
        await session.abbortTransaction();

        console.error(error);
        throw error;
    } finally {
        session.endSession();

    }
}

module.export = transferMoney;

