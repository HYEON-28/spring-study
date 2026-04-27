# 네트워크 (VPC, 서브넷, Security Group)

**Status:** 적용 완료 (NAT Gateway 제외)

## VPC

| 항목 | 값 |
|------|----|
| CIDR | `10.0.0.0/16` |
| 리전 | `ap-northeast-2` |

## 서브넷

ALB Multi-AZ 요구사항 및 RDS Subnet Group(2개 AZ 필수)을 위해 4개 서브넷.

| 이름 | CIDR | 타입 | 배치되는 리소스 |
|------|------|------|-----------------|
| Public-a | `10.0.1.0/24` | Public | ALB (AZ-a), (필요 시) NAT Gateway |
| Public-b | `10.0.2.0/24` | Public | ALB (AZ-b) |
| Private-a | `10.0.11.0/24` | Private | Fargate, RDS, Redis (AZ-a) |
| Private-b | `10.0.12.0/24` | Private | Fargate, RDS, Redis (AZ-b) |

> 현재 Fargate는 비용 절감을 위해 Public Subnet에 배치하고 Security Group으로 트래픽 통제. 운영 안정화 이후 Private Subnet으로 이동 + NAT Gateway 도입 예정.

## Internet Gateway

- VPC에 IGW 1개 attach
- Public 서브넷의 라우팅 테이블에서 `0.0.0.0/0 → IGW`

## NAT Gateway

**미도입 (보류).**

- 시간당 $0.059 × 24 × 30 ≈ **월 $42** + 데이터 처리 $0.059/GB
- Fargate를 Public Subnet에 두면 NAT 없이도 외부 인터넷 호출 가능
- Fargate ↔ RDS 통신은 VPC 내부(local 라우팅)이므로 NAT 불필요
- 도입 시점: 서비스 안정화 + 매출 발생 이후

## 라우팅 테이블

| 서브넷 종류 | 규칙 |
|-------------|------|
| Public | `10.0.0.0/16 → local`, `0.0.0.0/0 → IGW` |
| Private | `10.0.0.0/16 → local` (NAT 도입 시 `0.0.0.0/0 → NAT`) |

## Security Group

| SG 이름 | 인바운드 허용 | 비고 |
|---------|--------------|------|
| `alb-sg` | **80, 443**: `0.0.0.0/0` | 인터넷 직접 노출. 보안 강화 필요 시 ALB에 WAF 직접 attach |
| `fargate-sg` | **8080**: `alb-sg`만 | 앱 포트 |
| `rds-sg` | **3306**: `fargate-sg`만 | MySQL |

규칙:
- ALB는 80(HTTP) 인바운드도 열어두고 ALB Listener에서 80→443 리다이렉트 처리한다.
- 모든 내부 통신은 SG 참조(IP/CIDR 아님)로 정의해서 IP 변경에 무관하게 한다.

## NACL

기본값(전부 허용) 유지. 통제는 Security Group에서만 한다.
