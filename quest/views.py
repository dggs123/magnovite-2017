from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from django.contrib import messages
from django.views.decorators.http import require_http_methods

from .models import QuestScore, Quest

def index(req):
    if settings.DEBUG:
        template = 'magnovite/quest.html'
    else:
        template = 'magnovite/dist/quest.html'

    if not req.user.is_authenticated():
        messages.error(req, 'Please login to play the game')
        current_level = 1
        quest_score = None
    else:
        quest_score, created = QuestScore.objects.get_or_create(profile=req.user.profile)
        if created:
            quest_score.max_level = 1
            quest_score.save()

        current_level = quest_score.max_level


    quests = Quest.objects.all()

    try:
        current_quest = quests.get(level=current_level)
        completed = False
    except Quest.DoesNotExist:
        completed = True
        current_quest = None

    # display 5
    questscores = QuestScore.objects.all()[:5]

    if quest_score and quest_score.sort_key:
        position = QuestScore.objects.filter(sort_key__gt=quest_score.sort_key).count()
        position += 1
    else:
        position = None

    return render(req, template, {
        'quests': quests,
        'questscores': questscores,
        'cscore': quest_score,
        'cquest': current_quest,
        'completed': completed,
        'position': position,
    })


@require_http_methods(['POST'])
def guess(req):
    if not req.user.is_authenticated():
        return JsonResponse({
            'status': 'login',
            'messsage': 'Please login to play the game'
        }, status=401)


    if not req.POST.get('answer', ''):
        return JsonResponse({
            'status': 'invalid_answer',
            'message': 'Please provide an answer'
        }, status=400)

    profile = req.user.profile
    answer = req.POST.get('answer', '')

    score, created = QuestScore.objects.get_or_create(profile=profile)
    if created:
        score.max_level = 1

    try:
        quest = Quest.objects.get(level=score.max_level)
    except Quest.DoesNotExist:
        # user has finished all levels
        return JsonResponse({
            'status': 'invalid_level',
            'message': 'User has finished all levels'
        }, status=400)

    # check answer, maybe use fuzzy matching
    if answer.lower() == quest.answer.lower():
        score.next_level()
        score.save()

        messages.success(req, 'Congratulations! That is correct')

        return JsonResponse({
            'status': 'success',
            'message': 'Congratulations! That is correct'
        }, status=200)
    else:
        return JsonResponse({
            'status': 'invalid_answer',
            'message': 'Sorry! That is not correct'
        }, status=400)

