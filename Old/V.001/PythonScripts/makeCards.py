import random
import math


numSingleNut = 10
numDoubleNut = 10
numTripleNut = 20

cardTypes = [
	'agenda',
	'bonus',
	'event',
	'order',
]

# What type of card we are making.
cardType = "order"

# How many of each bonus card we make.
bonusCardPerType = 4

# Maps from card type to common concepts.
cardTypeToFileName = {
	'agenda': "AgendaCards.html",
	'bonus': "BonusCards.html",
	'event': "EventCards.html",
	'order': "OrderCards.html",
}

cardTypeToBackImage = {
	'agenda': "Agenda/Agenda.Back.png",
	'bonus': "Bonus/Bonus.Back.png",
	'event': "Event/Event.Back.png",
	'order': "Order/Order.Back.png",
}

cardTypeToSizeStyle = {
	'agenda': "standard_rect",
	'bonus': "small_square",
	'event': "standard_rect",
	'order': "standard_rect",
}


cardTypeToCardsPerPage = {
	'agenda': 9,
	'bonus': 12,
	'event': 9,
	'order': 9,
}

# Simple card fronts by type.
agendaCardFronts = [
	'Agenda/Agenda.Almond.png',
	'Agenda/Agenda.Big.png',
	'Agenda/Agenda.Chaos.png',
	'Agenda/Agenda.Peanut.png',
	'Agenda/Agenda.Raw.png',
	'Agenda/Agenda.Roasted.png',
	'Agenda/Agenda.Salted.png',
	'Agenda/Agenda.Small.png',
	'Agenda/Agenda.Unsalted.png',
]

eventCardFronts = [
	'Event/Event.Almond.Boo.png',
	'Event/Event.Almond.Yay.png',
	'Event/Event.DoubleAlmond.png',
	'Event/Event.DoublePeanut.png',
	'Event/Event.MorePoop.png',
	'Event/Event.NoPoop.png',
	'Event/Event.Peanut.Boo.png',
	'Event/Event.Peanut.Yay.png',
	'Event/Event.PretzelDay.png',
	'Event/Event.Raw.Boo.png',
	'Event/Event.Raw.Yay.png',
	'Event/Event.Roasted.Boo.png',
	'Event/Event.Roasted.Yay.png',
	'Event/Event.Salted.Boo.png',
	'Event/Event.Salted.Yay.png',
	'Event/Event.Unsalted.Boo.png',
	'Event/Event.Unsalted.Yay.png',
]

bonusCardFronts = [
	'Bonus/Bonus.Employee.png',
	'Bonus/Bonus.Expertise.png',
	'Bonus/Bonus.Money.20.png',
	'Bonus/Bonus.Money.30.png',
	'Bonus/Bonus.Money.40.png',
]

orderVerticalPadding = 10

fileHeader = """

<head>
	<link rel="stylesheet" href="shared_style.css">
	<link href='https://fonts.googleapis.com/css?family=Courier' rel='stylesheet'>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type">
    <style type="text/css">
		.card_title_wrapper_class {{
		  	background-image: linear-gradient(#eee, #aaa);
		  	border-radius: 10px;
			margin-top: 10px;
			margin-left: 10px;
			margin-right: 10px;
		}}

		.card_title_class {{
			font-family: 'Courier';
			font-size: 18px;
			padding-top: {0}px;
		}}

		.card_clout_class {{
			font-family: 'Courier';
			padding-top: {0}px;
			color: 008800;
			font-size: 18px;
		}}

		.card_nuts_class {{
			display: flex;
			justify-content: center;
			padding-top: {0}px;
		}}

		.card_trash_class {{
			display: flex;
			justify-content: center;
			padding-top: {0}px;
		}}

		.card_employees_class {{
			display: flex;
			justify-content: center;
			padding-top: {0}px;
		}}

		.card_back_stab_class {{
			height: 30px;
			width: 70%;
			margin: 0 auto;
			margin-top: {0}px;
			border: 1.33px solid #000000;
			border-radius: 10px;
		}}

		.meeple {{
			border-radius: 50%;
			border: 1.33px solid #000000;
			margin-top: auto;
			margin-bottom: auto;
			margin-left: 5px;
			margin-right: 5px;
			display: block;
		}}
		.manager {{
			height: 40px;
			width: 40px;
		}}

		.employee {{
			height: 30px;
			width: 30px;
		}}

		.back_stab_image_class {{
			width: auto;
			height: 100%;
		}}
    </style>
</head>

<body class="c1 doc-content">
"""

fileFooter = """
</body>

</html>
"""

startNutGroup = """
<div class="nut_group">
"""

endNutGroup = """
            </div>
"""

startPage = """
    <div class="page_of_items">
		<div class="wrapper">
"""

startBackPage = """
    <div class="page_of_items">
		<div class="wrapper card_back">
"""

endPage = """
		</div>
	</div>
"""

cardsThisPage = 0

def addDivWithClassAndContents(sourceFile, cssClass, contents):
	print("<div class=\"" + cssClass + "\">", file = sourceFile)
	print(contents, file = sourceFile)
	print("</div>", file = sourceFile)

def addTitle(sourceFile, title):
	contentTemplate = """
	<div class="card_title_class" title="">{0}</div>
"""
	addDivWithClassAndContents(sourceFile, "card_title_wrapper_class", contentTemplate.format(title))

	return contentTemplate.format(title)

def addClout(sourceFile, managerClout, employeeClout):
	content = "Clout: " + str(managerClout) + "/" + str(employeeClout)
	addDivWithClassAndContents(sourceFile, "card_clout_class", content)

def makeNutContent(nutDesc):
	contentTemplate = """
	<div class="main_nut_desc main_nut_for_order">
		<img class="nut_image" alt="" src="images/{0}" title="">
		<img class="salted_image" alt="" src="images/{1}" title="">
		<img class="roasted_image" alt="" src="images/{2}" title="">
	</div>
"""

	saltedImage = "Order/Order.Wild.png"
	if nutDesc["salted"] == 1:
		saltedImage = "NutProps/Salted.Y.png"
	elif nutDesc["salted"] == 2:
		saltedImage = "NutProps/Salted.N.png"

	roastedImage = "Order/Order.Wild.png"
	if nutDesc["roasted"] == 1:
		roastedImage = "NutProps/Roasted.Y.png"
	elif nutDesc["roasted"] == 2:
		roastedImage = "NutProps/Roasted.N.png"

	nutImage = "Order/Order.Wild.png"
	if nutDesc["nutType"] == 1:
		nutImage = "NutProps/Nut.Peanut.png"
	elif nutDesc["nutType"] == 2:
		nutImage = "NutProps/Nut.Almond.png"

	content = contentTemplate.format(nutImage, saltedImage, roastedImage)
	return content

def addNutDescs(sourceFile, nutDescs):
	content = ""

	for nutDesc in nutDescs:
		nutContent = makeNutContent(nutDesc)
		content = content + nutContent

	addDivWithClassAndContents(sourceFile, "card_nuts_class", content)

def addTrash(sourceFile, numTrash):
	content = ""

	for i in range(0, numTrash):
		trashContent = 	contentTemplate = """<div class="trash"><img class="trash_image" alt="" src="images/Order/Trash.png" title=""></div>"""
		content = content + trashContent

	addDivWithClassAndContents(sourceFile, "card_trash_class", content)

def addEmployees(sourceFile, nutDescs):
	manager = """
	<img class="manager meeple" alt="" src="images/Order/Order.Meeple.png" title="">
"""
	employee = """
	<img class="employee meeple" alt="" src="images/Order/Order.Meeple.png" title="">
"""

	content = manager

	numEmployees = len(nutDescs)
	for i in range(0, numEmployees):
		content = content + employee
	addDivWithClassAndContents(sourceFile, "card_employees_class", content)

def addBackStab(sourceFile):
	content = """
	<img class="back_stab_image_class" alt="" src="images/Order/Order.Dagger.png" title="">
"""
	addDivWithClassAndContents(sourceFile, "card_back_stab_class", content)

def addOrderCard(sourceFile, orderDesc):
	print("<div class=\"card standard_rect\">", file = sourceFile)
	addTitle(sourceFile, orderDesc["table"])
	addNutDescs(sourceFile, orderDesc["nutDescs"])
	addTrash(sourceFile, len(orderDesc["nutDescs"]))
	addEmployees(sourceFile, orderDesc["nutDescs"])
	addClout(sourceFile, orderDesc["managerClout"], orderDesc["employeeClout"])
	addBackStab(sourceFile)
	print("</div>", file = sourceFile)

def addSimpleCard(sourceFile, cardDesc):
	template = """
		<div class="card {0}">
			<img class="card_image" alt="" src="images/{1}" title="">
		</div>
	"""
	content = template.format(cardTypeToSizeStyle[cardType], cardDesc['cardFront'])
	print(content, file = sourceFile)



def printBacks(sourceFile, count):
	template = """
		<div class="card {1}">
			<img class="card_image" alt="" src="images/{0}" title="">
		</div>
	"""
	content = template.format(cardTypeToBackImage[cardType], cardTypeToSizeStyle[cardType])

	print(startBackPage, file = sourceFile)
	for i in range(0, count):
		print(content, file = sourceFile)
	print(endPage, file = sourceFile)

def addOrderCards(sourceFile, orderDescs):
	global cardsThisPage
	cardsPerPage = cardTypeToCardsPerPage[cardType]

	for orderDesc in orderDescs:
		if cardsThisPage == 0:
			print(startPage, file = sourceFile)

		addOrderCard(sourceFile, orderDesc)
		cardsThisPage = cardsThisPage + 1
		if cardsThisPage == cardsPerPage:
			print(endPage, file = sourceFile)
			printBacks(sourceFile, cardsThisPage)
			cardsThisPage = 0

def addSimpleCards(sourceFile, cardDescs):
	global cardsThisPage
	cardsPerPage = cardTypeToCardsPerPage[cardType]

	for cardDesc in cardDescs:
		if cardsThisPage == 0:
			print(startPage, file = sourceFile)

		addSimpleCard(sourceFile, cardDesc)
		cardsThisPage = cardsThisPage + 1
		if cardsThisPage == cardsPerPage:
			print(endPage, file = sourceFile)
			printBacks(sourceFile, cardsThisPage)
			cardsThisPage = 0


def makeRandomNutDesc():
	nutDesc = {}
	nutDesc["nutType"] = random.randrange(3)
	nutDesc["salted"] = random.randrange(3)
	nutDesc["roasted"] = random.randrange(3)

	return nutDesc

def calculateManagerClout(nutDescs):
	totalClout = 1
	nutDiffs = 0
	saltDiffs = 0
	roastDiffs = 0
	nonNilNut = 0
	nonNilSalt = 0
	nonNilRoast = 0

	for nutDesc in nutDescs:
		if nutDesc["nutType"] != 0:
			totalClout += 1
			if nonNilNut != 0 and nonNilNut != nutDesc["nutType"]:
				nutDiffs = 1
			nonNilNut = nutDesc["nutType"]

		if nutDesc["salted"] != 0:
			totalClout += 1
			if nonNilSalt != 0 and nonNilSalt != nutDesc["salted"]:
				saltDiffs = 1
			nonNilSalt = nutDesc["salted"]

		if nutDesc["roasted"] != 0:
			totalClout += 1
			if nonNilRoast != 0 and nonNilRoast != nutDesc["roasted"]:
				roastDiffs = 1
			nonNilRoast = nutDesc["roasted"]

	if nutDiffs == 1:
		totalClout += 1
	if saltDiffs == 1:
		totalClout += 1
	if roastDiffs == 1:
		totalClout += 1

	return totalClout


orderNumber = 3045

def makeRandomOrderDesc(numNuts):
	global orderNumber
	orderDesc = {}
	orderDesc["table"] = "Order #" + str(orderNumber)
	orderNumber = orderNumber + 1

	nutDescs = []
	for i in range(0, numNuts):
		nutDesc = makeRandomNutDesc()
		nutDescs.append(nutDesc)
	orderDesc["nutDescs"] = nutDescs

	managerClout = calculateManagerClout(nutDescs)
	orderDesc["managerClout"] = managerClout

	employeeClout = math.floor(managerClout/3)
	if employeeClout == 0:
		employeeClout = 1
	orderDesc["employeeClout"] = employeeClout

	return orderDesc

def makeRandomOrderDescs():
	retVal = []
	for i in range(0, numSingleNut):
		desc = makeRandomOrderDesc(1)
		retVal.append(desc)
	for i in range(0, numDoubleNut):
		desc = makeRandomOrderDesc(2)
		retVal.append(desc)
	for i in range(0, numTripleNut):
		desc = makeRandomOrderDesc(3)
		retVal.append(desc)

	return retVal


def makeSimpleCardDescsFromFronts(cardFronts, countPerFront):
	cardDescs = []
	for cardFront in cardFronts:
		for i in range(0, countPerFront):
			cardDesc = {
				'cardFront': cardFront,
			}
			cardDescs.append(cardDesc)
	return cardDescs

def makeSimpleCardDescs():
	cardDescs = []
	if cardType == 'agenda':
		cardDescs = makeSimpleCardDescsFromFronts(agendaCardFronts, 1)
	elif cardType == 'event':
		cardDescs = makeSimpleCardDescsFromFronts(eventCardFronts, 1)
	else:
		cardDescs = makeSimpleCardDescsFromFronts(bonusCardFronts, bonusCardPerType)
	return cardDescs

#####################
# Main Program
#####################
# Open the file.
fileName = cardTypeToFileName[cardType]

sourceFile = open('../Html/' + fileName, 'w')

# Write the file header.
print(fileHeader.format(orderVerticalPadding), file = sourceFile)

if cardType == 'order':
	orderDescs = makeRandomOrderDescs()
	addOrderCards(sourceFile, orderDescs)
else:
	simpleCardDescs = makeSimpleCardDescs()
	addSimpleCards(sourceFile, simpleCardDescs)

if cardsThisPage > 0:
	print(endPage, file = sourceFile)
	printBacks(sourceFile, cardsThisPage)

# Write the file footer.
print(fileFooter, file = sourceFile)

sourceFile.close()

print("File {0} is generated".format(fileName))