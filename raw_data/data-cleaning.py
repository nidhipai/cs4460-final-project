import pandas as pd

csv1 = pd.read_csv("/Users/tyler/Documents/GT/GT_Classes/Y4S1/CS_4460/cs4460-final-project/raw_data/oura_2021-12-28_2022-11-21_trends.csv")
csv2 = pd.read_csv("/Users/tyler/Documents/GT/GT_Classes/Y4S1/CS_4460/cs4460-final-project/raw_data/HealthAutoExport-2021-11-12-2022-11-19-Data.csv")

merged_data = csv1.merge(csv2,on=["Date"],how='inner')
df = merged_data

# Drop nans
df = df.dropna(subset=['Bedtime Start', 'Bedtime End', 'Total Sleep Duration']).reset_index(drop=True)
# Drop 0s
# df.loc[~(df==0).any(subset=['Total Sleep Duration'])]
df= df[df['Total Sleep Duration'] != 0]

def convertTimeString(time):
	# 2021-12-31T23:08:29-05:00
	time = time.split('T')[-1]
	# 23:08:29-05:00
	time = time.split('-')[-0]
	# 23:08:29

	hour = int(time.split(':')[0])
	minute = int(time.split(':')[1])

	hour = hour if hour < 16 else (hour - 24)
	minute = minute if hour < 16 else 1 - minute
	minute *= (100/60)
	minute /= 100


	time = hour + minute
	time = round(time, 2)

	return str(time)

def secondsToHours(time):
	return time / 3600


df['Bedtime Start'] = [str(x) for x in df['Bedtime Start']]
df['Bedtime Start'] = [convertTimeString(x) for x in df['Bedtime Start']]

df['Bedtime End'] = [str(x) for x in df['Bedtime End']]
df['Bedtime End'] = [convertTimeString(x) for x in df['Bedtime End']]

df['Total Sleep Duration'] = [secondsToHours(x) for x in df['Total Sleep Duration']]

df['REM Sleep Duration'] = [secondsToHours(x) for x in df['REM Sleep Duration']]

df['Date'] = pd.to_datetime(df['Date'])


df.to_csv("/Users/tyler/Documents/GT/GT_Classes/Y4S1/CS_4460/cs4460-final-project/data.csv")


