all: fastJudge runguard

fastJudge:
	g++ ./src/main/runner/fastJudge.cpp -o ./src/main/runner/fastJudge && \
  cp ./src/main/runner/fastJudge ./release/app/binaries/
runguard:
	g++ ./src/main/runner/runguard.cpp -o ./src/main/runner/runguard && \
  cp ./src/main/runner/runguard ./release/app/binaries/

clean:
	rm ./src/main/runner/fastJudge ./src/main/runner/runguard
