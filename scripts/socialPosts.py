import sys

if sys.argv[1] == 'twitter':
	tweet = sys.argv[2] + '\n' + 'Destination: ' + sys.argv[3] + '\n' + 'Details: ' + sys.argv[4]
	print(tweet)