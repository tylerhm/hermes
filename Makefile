all: fastJudge runguard

fastJudge:
	g++ ./src/main/runner/fastJudge.cpp -o ./src/binaries/fastJudge && \
  cp ./src/binaries/fastJudge ./release/app/binaries/
runguard:
	g++ ./src/main/runner/runguard.cpp -o ./src/binaries/runguard && \
  cp ./src/binaries/runguard ./release/app/binaries/

clean:
	rm ./src/main/runner/fastJudge ./src/main/runner/runguard
