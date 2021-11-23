import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useList } from '../src';
import myReposRespository from './repository/myReposRepository';
import { observer } from 'mobx-react-lite';

interface GithubRepo {
  id: number;
  name: string;
}

const App = observer(() => {
  const myReposList = useList(myReposRespository);

  React.useEffect(() => {
    myReposList.fetch();
  }, []);

  if (myReposList.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {myReposList.list.map((repo: GithubRepo) => (
        <p key={repo.id}>- {repo.name}</p>
      ))}
    </div>
  );
});

ReactDOM.render(<App />, document.getElementById('root'));
