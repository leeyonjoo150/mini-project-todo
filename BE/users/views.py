from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    TokenSerializer
)


def get_tokens_for_user(user):
    """사용자에 대한 JWT 토큰 생성"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@extend_schema(
    tags=['Users'],
    request=UserRegistrationSerializer,
    responses={
        201: TokenSerializer,
        400: OpenApiResponse(description='Validation Error')
    },
    description='회원가입 및 자동 로그인'
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """회원가입"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)

        return Response({
            'message': '회원가입이 완료되었습니다.',
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Users'],
    request=UserLoginSerializer,
    responses={
        200: TokenSerializer,
        401: OpenApiResponse(description='Invalid credentials')
    },
    description='로그인 및 JWT 토큰 발급'
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """로그인"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)

        if user is not None:
            tokens = get_tokens_for_user(user)
            return Response({
                'message': '로그인 성공',
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response({
            'detail': '아이디 또는 비밀번호가 올바르지 않습니다.'
        }, status=status.HTTP_401_UNAUTHORIZED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Users'],
    responses={
        200: UserSerializer,
    },
    description='현재 로그인한 사용자 정보 조회'
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """내 정보 조회"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
