# post-run-action

This action runs a script in the post process.
It is assumed that it will be called and used with a composite action that cannot perform post processing.

## Usage

See [action.yml](./action.yml)

```yaml
- name: Post Action
  uses: srz-zumix/post-run-action@v1
  with:
    # custom shell
    # Default : bash -e {0}
    # bash    : bash --noprofile --norc -eo pipefail {0}
    # custom  : e.g. `bash -l -ex {0}`
    # see https://docs.github.com/ja/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsshell
    shell: bash -ex {0}
    # post run script text
    post-run: |
      echo "test" | tee "${{ runner.temp }}/test.txt"
      if [ -f "${{ runner.temp }}/post.sh" ]; then
        "${{ runner.temp }}/post.sh"
      fi
- name: Post Action (Python)
  id: test-python
  uses: srz-zumix/post-run-action@v1
  with:
    shell: python
    post-run: |
      print("Hello, world!")


```
