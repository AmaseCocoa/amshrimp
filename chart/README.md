# iceshrimp

![Version: 0.1.2](https://img.shields.io/badge/Version-0.1.2-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: rc](https://img.shields.io/badge/AppVersion-rc-informational?style=flat-square)

A fun, new, open way to experience social media https://iceshrimp.dev

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://raw.githubusercontent.com/bitnami/charts/archive-full-index/bitnami | elasticsearch | 19.0.1 |
| https://raw.githubusercontent.com/bitnami/charts/archive-full-index/bitnami | postgresql | 11.1.3 |
| https://raw.githubusercontent.com/bitnami/charts/archive-full-index/bitnami | redis | 16.13.2 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| autoscaling.enabled | bool | `false` |  |
| autoscaling.maxReplicas | int | `100` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| iceshrimp.allowedPrivateNetworks | list | `[]` | If you want to allow iceshrimp to connect to private ips, enter the cidrs here. |
| iceshrimp.clusterLimit | integer | `1` | Number of worker processes per replica |
| iceshrimp.deepl.authKey | string | `""` |  |
| iceshrimp.deepl.isPro | bool | `false` |  |
| iceshrimp.deepl.managed | bool | `false` |  |
| iceshrimp.domain | string | `"iceshrimp.local"` |  |
| iceshrimp.isManagedHosting | bool | `true` |  |
| iceshrimp.libreTranslate.apiKey | string | `""` |  |
| iceshrimp.libreTranslate.apiUrl | string | `""` |  |
| iceshrimp.libreTranslate.managed | bool | `false` |  |
| iceshrimp.maxNoteLength | integer | `3000` | Max note length |
| iceshrimp.objectStorage.access_key | string | `""` |  |
| iceshrimp.objectStorage.access_secret | string | `""` |  |
| iceshrimp.objectStorage.baseUrl | string | `""` |  |
| iceshrimp.objectStorage.bucket | string | `""` |  |
| iceshrimp.objectStorage.endpoint | string | `""` |  |
| iceshrimp.objectStorage.managed | bool | `true` |  |
| iceshrimp.objectStorage.prefix | string | `"files"` |  |
| iceshrimp.objectStorage.region | string | `""` |  |
| iceshrimp.reservedUsernames[0] | string | `"root"` |  |
| iceshrimp.reservedUsernames[1] | string | `"admin"` |  |
| iceshrimp.reservedUsernames[2] | string | `"administrator"` |  |
| iceshrimp.reservedUsernames[3] | string | `"me"` |  |
| iceshrimp.reservedUsernames[4] | string | `"system"` |  |
| iceshrimp.smtp.from_address | string | `"notifications@example.com"` |  |
| iceshrimp.smtp.login | string | `""` |  |
| iceshrimp.smtp.managed | bool | `true` |  |
| iceshrimp.smtp.password | string | `""` |  |
| iceshrimp.smtp.port | int | `587` |  |
| iceshrimp.smtp.server | string | `"smtp.mailgun.org"` |  |
| iceshrimp.smtp.useImplicitSslTls | bool | `false` |  |
| iceshrimp.strategy | object | `{}` | Override DeploymentStrategy for Iceshrimp |
| elasticsearch | object | `{"auth":{},"enabled":false,"hostname":"","port":9200,"ssl":false}` | https://github.com/bitnami/charts/tree/master/bitnami/elasticsearch#parameters |
| fullnameOverride | string | `""` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"iceshrimp.dev/iceshrimp/iceshrimp"` |  |
| image.tag | string | `""` |  |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations | object | `{}` |  |
| ingress.className | string | `""` |  |
| ingress.enabled | bool | `false` |  |
| ingress.hosts[0].host | string | `"chart-example.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| ingress.tls | list | `[]` |  |
| nameOverride | string | `""` |  |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| postgresql.auth.database | string | `"iceshrimp_production"` |  |
| postgresql.auth.password | string | `""` |  |
| postgresql.auth.username | string | `"iceshrimp"` |  |
| postgresql.enabled | bool | `true` | disable if you want to use an existing db; in which case the values below must match those of that external postgres instance |
| redis.auth.password | string | `""` | you must set a password; the password generated by the redis chart will be rotated on each upgrade: |
| redis.enabled | bool | `true` |  |
| redis.hostname | string | `""` |  |
| redis.port | int | `6379` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| securityContext | object | `{}` |  |
| service.port | int | `80` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.create | bool | `true` |  |
| serviceAccount.name | string | `""` |  |
| tolerations | list | `[]` |  |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.11.0](https://github.com/norwoodj/helm-docs/releases/v1.11.0)
