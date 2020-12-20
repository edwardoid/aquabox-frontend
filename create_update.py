#!/usr/bin/python2

import sys

name = sys.argv[1]
version = sys.argv[2]
postfix = sys.argv[3]
host = sys.argv[4]
location = sys.argv[5]

template = """<update>
    <version>100$version</version>
    <name>$name</name>
    <url>$host/aquabox-$version.apk</url>
</update>"""

template = template.replace("$name", name).replace("$version", version).replace("$postfix", postfix).replace("$host", host)



f = open(location + "/aquabox-" + postfix + ".xml", 'w')
f.write(template)
f.close()
print(template)
