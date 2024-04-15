# Generates the nut tokens as an Html File.
# Open the file.

sourceFile = open('../Html/AllNutTokens.html', 'w')

nutTokenSize = 48

fileHeader = """
<head>
	<link rel="stylesheet" href="shared_style.css">
    <meta content="text/html; charset=UTF-8" http-equiv="content-type">
    <style type="text/css">
		.nut_group {{

		}}
    </style>
</head>

<body class="c1 doc-content">
"""

fileFooter = """
</body>

</html>
"""

# Write the file header.
print(fileHeader.format(nutTokenSize), file = sourceFile)

nutImages = [
    "NutProps/Nut.Almond.png",
    "NutProps/Nut.Peanut.png",
]

saltedImages = [
    "NutProps/Salted.Y.png",
    "NutProps/Salted.N.png",
]

roastedImages = [
    "NutProps/Roasted.Y.png",
    "NutProps/Roasted.N.png",
]

nutClauseTemplate = """<div class="main_nut_desc main_nut_for_token"><img class="nut_image" alt="" src="images/{0}" title=""><img class="salted_image" alt="" src="images/{1}" title=""><img class="roasted_image" alt="" src="images/{2}" title=""></div>"""

startNutGroup = """<div class="nut_group">"""

endNutGroup = """</div>"""

startPage = """<div class="page_of_items"><div class="wrapper">"""

endPage = """</div></div>"""

def makeNuts(nutImage):
	print(startPage, file = sourceFile)
	for saltedImage in saltedImages:
		for roastedImage in roastedImages:
			print(startNutGroup, file = sourceFile)
			for i in range (0, 30):
				nutClause = nutClauseTemplate.format(nutImage, saltedImage, roastedImage)
				print(nutClause, file = sourceFile, end='')
			print(endNutGroup, file = sourceFile)
	print(endPage, file = sourceFile)

# N copies of each possible nut.
for nutImage in nutImages:
	makeNuts(nutImage)
	# 2 sided
	makeNuts(nutImage)

# Write the file footer.
print(fileFooter, file = sourceFile)

sourceFile.close()

print("File is generated")