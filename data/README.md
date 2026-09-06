# 카드 숫자 수정하기

[practice-stats.json](practice-stats.json)의 숫자를 수정해서 `main` 브랜치에 커밋하면 GitHub Actions가 SWEA·BOJ 카드를 다시 만들고 프로필에 반영합니다. 웹에서는 파일의 연필 버튼 → 수정 → **Commit changes**를 누르면 됩니다. PC에서 수정할 때는 커밋과 push까지 해야 GitHub 프로필에 반영됩니다.

- `updatedAt`: 각 사이트 기록을 확인한 날짜 (`YYYY-MM-DD`). SWEA와 BOJ를 따로 입력합니다.
- `swea.solvedByDifficulty`: D1~D8별 푼 문제 수.
- `swea.submittedProblems`: 제출한 문제 수.
- `swea.masterProblems`: SWEA에 표시되는 Master Problem 수.
- `swea.completedCourses`: 수료한 강의 수.
- `swea.joinedClubs`: 가입한 클럽 수.
- `boj.solvedByTier`: Bronze~Ruby별 푼 문제 수. 본인 계정의 티어와는 다릅니다.
- `boj.selectedTags`: 구현·수학·그래프 이론·DP 문제 수. 한 문제가 여러 태그에 포함될 수 있습니다.

예를 들어 D3 문제를 하나 더 풀었다면 `"D3": 58`을 `"D3": 59`로 바꾸면 됩니다. 제출한 문제 수 등은 사이트에서 확인한 값을 각각 입력하세요.

**푼 문제 합계, 막대 길이, 두 카드의 공통 눈금, 설명문, 라이트·다크 이미지가 자동으로 갱신됩니다.** 합계를 직접 입력할 필요는 없습니다. 바뀐 이미지에는 새로운 파일 주소를 사용하므로 이전 이미지가 캐시에 남는 문제도 피합니다.

숫자는 0 이상의 정수로 입력하고 JSON의 따옴표·쉼표·항목 이름은 유지하세요. 값이 잘못되면 작업이 실패하며 이전 카드는 유지됩니다. 실행 결과는 저장소의 **Actions → Update practice cards**에서 확인할 수 있습니다.

이 기능은 이 파일의 기록으로 카드를 생성합니다. SWEA·백준 사이트에서 기록을 자동으로 가져오거나 그래프를 애니메이션으로 재생하지는 않습니다.

로컬에서 미리 생성하려면 Node.js 22 이상에서 실행하세요. 별도 패키지 설치는 필요 없습니다.

```sh
node scripts/render-practice-cards.cjs
```
