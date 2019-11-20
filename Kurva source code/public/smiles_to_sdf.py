# Python script that is supposed to be altered by the SMILES to SDF comoutation

import sys
import json

json_data = " ".join(sys.argv[1:])
# Load  ds input as JSON
my_data = json.loads(json_data)


# Adds LOVE at the end of every SMILES formula
for formula in my_data["formulas"]:
	formula["smiles"] = formula["smiles"] + 'LOVE'

# Print the output to stdout to return it back to Node.js
print(json.dumps(my_data))
sys.stdout.flush()

# print("Hello world");

