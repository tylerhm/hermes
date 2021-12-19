all: fastJudge runguard

fastJudge:
	g++ ./src/main/runner/fastJudge.cpp -o ./src/main/runner/fastJudge
runguard:
	g++ ./src/main/runner/runguard.cpp -o ./src/main/runner/runguard

clean:
	rm ./src/main/runner/fastJudge ./src/main/runner/runguard
