# post-run-action

This action runs a script in the post process.
It is assumed that it will be called and used with a composite action that cannot perform post processing.

## Usage

See [action.yml](./action.yml)

```yaml
- name: Post Action
  uses: srz-zumix/post-run-action@v2
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
  uses: srz-zumix/post-run-action@v2
  with:
    shell: python
    post-run: |
      print("Hello, world!")


```

## Note on Expression Evaluation Timing

The `post-run` input is evaluated when the step is first processed (during the main phase), not when the post-run script actually executes.
This means that any expressions using `${{ ... }}` syntax (e.g., `${{ env.MY_VAR }}`) will capture the values at the time the step is set up, not at the time the post-run script runs.

For example:

```yaml
env:
  MY_VAR: initial_value

steps:
  - uses: srz-zumix/post-run-action@v2
    with:
      post-run: |
        # ${{ env.MY_VAR }} is evaluated at step setup time
        echo "Expression value: ${{ env.MY_VAR }}"  # Will output: initial_value
        echo "Environment value: $MY_VAR"            # Will output: modified_value

  - run: echo "MY_VAR=modified_value" >> "$GITHUB_ENV"
```

In this example, even though `MY_VAR` is modified before the post-run script executes, the expression `${{ env.MY_VAR }}` will still contain `initial_value` because it was evaluated when the step was first processed.

To use values that may change during the workflow, reference environment variables directly (e.g., `$MY_VAR` in bash) instead of using expressions.

