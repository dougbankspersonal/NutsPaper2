foo = """
<head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type">
    <style type="text/css">
        ol {{
            margin: 0;
            padding: 0
        }}

        table td,
        table th {{
            padding: 0
        }}

        .c0 {{
            color: #000000;
            font-weight: 400;
            text-decoration: none;
            vertical-align: baseline;
            font-size: 11pt;
            font-family: "Arial";
            font-style: normal
        }}

        .c2 {{
            padding-top: 0pt;
            padding-bottom: 0pt;
            line-height: 1.15;
            text-align: left
        }}

        .c1 {{
            background-color: #ffffff;
            max-width: 612pt;
            padding: 0pt 0pt 0pt 0pt;
            margin: 0px;
        }}

        .title {{
            padding-top: 0pt;
            color: #000000;
            font-size: 26pt;
            padding-bottom: 3pt;
            font-family: "Arial";
            line-height: 1.15;
            page-break-after: avoid;
            orphans: 2;
            widows: 2;
            text-align: left
        }}

        .subtitle {{
            padding-top: 0pt;
            color: #666666;
            font-size: 15pt;
            padding-bottom: 16pt;
            font-family: "Arial";
            line-height: 1.15;
            page-break-after: avoid;
            orphans: 2;
            widows: 2;
            text-align: left
        }}

        .page_class {{
            page-break-after: always;
        }}

        .wrapper_class {{
            overflow: visible;
            text-align: center;
        }}

        .outer_nut {{
            overflow: hidden;
            margin: 1px;
            border: 1.33px solid #000000;
            width: {0}px;
            height: {0}px;
            display: inline-block;
            position: relative;
            float:left;
        }}

        .nut_image {{
            width: 80%;
            height: 80%;
            left: 10%;
            top: 10%;
            position: absolute;
            margin-left: 0.00px;
            margin-top: 0.00px;
            z-index: 1;
        }}

        .salted_image {{
            width: 40%;
            height: 40%;
            left: 4%;
            top: 4%;
            position: absolute;
            margin-left: 0.00px;
            margin-top: 0.00px;
            z-index: 2;
        }}

        .roasted_image {{
            width: 40%;
            height: 40%;
            right: 4%;
            bottom: 4%;
            position: absolute;
            margin-left: 0.00px;
            margin-top: 0.00px;
            z-index: 2;
        }}

        li {{
            color: #000000;
            font-size: 11pt;
            font-family: "Arial"
        }}

        p {{
            margin: 0;
            color: #000000;
            font-size: 11pt;
            font-family: "Arial"
        }}

        h1 {{
            padding-top: 20pt;
            color: #000000;
            font-size: 20pt;
            padding-bottom: 6pt;
            font-family: "Arial";
            line-height: 1.15;
            page-break-after: avoid;
            orphans: 2;
            widows: 2;
            text-align: left
        }}

        h2 {{
            padding-top: 18pt;
            color: #000000;
            font-size: 16pt;
            padding-bottom: 6pt;
            font-family: "Arial";
            line-height: 1.15;
            page-break-after: avoid;
            orphans: 2;
            widows: 2;
            text-align: left
        }}

        h3 {{
            padding-top: 16pt;
            color: #434343;
            font-size: 14pt;
            padding-bottom: 4pt;
            font-family: "Arial";
            line-height: 1.15;
            page-break-after: avoid;
            orphans: 2;
            widows: 2;
            text-align: left
        }}

        h4 {{
            padding-top: 14pt;
            color: #666666;
            font-size: 12pt;
            padding-bottom: 4pt;
            font-family: "Arial";
            line-height: 1.15;
            page-break-after: avoid;
            orphans: 2;
            widows: 2;
            text-align: left
        }}

        h5 {{
            padding-top: 12pt;
            color: #666666;
            font-size: 11pt;
            padding-bottom: 4pt;
            font-family: "Arial";
            line-height: 1.15;
            page-break-after: avoid;
            orphans: 2;
            widows: 2;
            text-align: left
        }}

        h6 {{
            padding-top: 12pt;
            color: #666666;
            font-size: 11pt;
            padding-bottom: 4pt;
            font-family: "Arial";
            line-height: 1.15;
            page-break-after: avoid;
            font-style: italic;
            orphans: 2;
            widows: 2;
            text-align: left
        }}
    </style>
</head>

<body class="c1 doc-content">
    <div class="page_class">
        <div class="wrapper_class">
"""

print(foo.format(35))