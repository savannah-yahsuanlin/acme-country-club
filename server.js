const express = require('express')
const {Sequelize, DataTypes} = require('sequelize')
const db = new Sequelize(process.env.DATABASE || 'postgres://localhost/acme_country')
const app = express()

const Member = db.define('members', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: {
		type: DataTypes.STRING
	}
})

const Facility = db.define('facilities', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: {
		type: DataTypes.STRING
	}
})

const Booking = db.define('bookings', {
	id:{
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	}
})

Member.belongsTo(Member, {as: 'sponsor'})
Member.hasMany(Member, {foreignKey: 'sponsorId'})

Booking.belongsTo(Member, {as: 'booker'})
Booking.belongsTo(Facility)

Facility.hasMany(Booking)

const seedAndSeed = async() => {
	await db.sync({force: true})
	
	const moe = await Member.create({name: 'moe'})
	const lucy = await Member.create({name: 'lucy'})
	const ethly = await Member.create({name: 'ethly'})
	const larry = await Member.create({name: 'larry'})

	const tennis = await Facility.create({name: 'tennis'})
	const pingPong = await Facility.create({name: 'pingPong'})
	const marbles = await Facility.create({name: 'marbles'})

	moe.sponsorId = lucy.id
	larry.sponsorId = lucy.id
	ethly.sponsorId = moe.id
	await moe.save()
	await larry.save()
	await ethly.save()

	await Booking.create({facilityId: marbles.id, bookerId: lucy.id})
	await Booking.create({facilityId: marbles.id, bookerId: lucy.id})
	await Booking.create({facilityId: tennis.id, bookerId: moe.id})
}

app.get('/api/members', async(req, res, next) => {
	try {
		res.send(await Member.findAll({
				include: [
					{
						model: Member, 
						as: 'sponsor'
					}
				]
			}
		))
	}
	catch(ex){
		next(ex)
	}
})

app.get('/api/facilities', async(req, res, next) => {
	try {
		res.send(await Facility.findAll({
				include: [Booking]
			}
		))
	}
	catch(ex){
		next(ex)
	}
})

const setUp = async(req, res) => {
	try {
		await db.authenticate()
		await seedAndSeed()
		const port = process.env.PORT || 2000
		app.listen(port, () => {
			console.log(`Listening on port ${port}`)
		})
	}
	catch(ex) {
		console.log(ex)
	}
}

setUp()
