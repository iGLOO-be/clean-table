
# Clean table Mysql

## Usage

```
$ clean-table --help
Options:
  --help               Show help                                       [boolean]
  --version            Show version number                             [boolean]
  --dsn                                                               [required]
  --table, -t          Table name                                     [required]
  --time-field         Column name
  --time-value         Number of days                                   [number]
  --filter             [COLUMN] [VALUE]                                  [array]
  --limit              Max record deleted              [number] [default: 50000]
  --debug                                                              [boolean]
  --dry-run, --dryrun                                                  [boolean]
```
