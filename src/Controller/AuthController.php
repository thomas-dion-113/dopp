<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\DBAL\DBALException;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use App\Entity\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    public function register(
        Request $request,
        UserPasswordEncoderInterface $encoder,
        MailerInterface $mailer,
        ValidatorInterface $validator
    ){
        $em = $this->getDoctrine()->getManager();

        $data = json_decode($request->getContent(), true);

        $name = $data['name'];
        $email = $data['email'];
        $password = $data['password'];
        $registrationToken = base64_encode(\random_bytes(30));

        try {
            $user = new User();
            $user->setName($name);
            $user->setEmail($email);
            $user->setPassword($encoder->encodePassword($user, $password));
            $user->setEnabled(false);
            $user->setRegistrationToken($registrationToken);

            $errorsObject = $validator->validate($user);

            if (count($errorsObject) > 0) {
                $errors = [];
                foreach ($errorsObject as $error) {
                    $errors[] = $error->getPropertyPath();
                }

                return new JsonResponse($errors, 400);
            }

            $em->persist($user);
            $em->flush();
        }
        catch(DBALException $e){
            $errorMessage = $e->getMessage();
            return new JsonResponse($errorMessage, 400);
        }
        catch(\Exception $e){
            $errorMessage = $e->getMessage();
            return new JsonResponse($errorMessage, 400);
        }

        $email = (new TemplatedEmail())
            ->from('no-reply@dopp.bzh')
            ->to($email)
            ->subject('Activez votre compte')
            ->context([
                'registrationToken' => $registrationToken,
            ])
            ->htmlTemplate('emails/register.html.twig');

        $mailer->send($email);

        return new Response(sprintf('User %s successfully created', $user->getUsername()));
    }

    public function emailVerify(string $token)
    {
        $em = $this->getDoctrine()->getManager();

        $user = $em->getRepository(User::class)->findOneByRegistrationToken($token);

        if (null === $user) {
            throw new NotFoundHttpException('');
        }

        $user->setEnabled(true);
        $user->setRegistrationToken(null);
        $em->flush();

        $url = $this->generateUrl('home',
            array(),
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        return new RedirectResponse($url . "login");
    }

    public function tokenCheck(MailerInterface $mailer)
    {
        if ($this->getUser() && $this->getUser()->getEnabled()) {
            $response = new Response();

            $response->headers->set('Content-Type', 'application/json');
            $response->headers->set('Access-Control-Allow-Origin', '*');

            $response->setContent(json_encode([
                'email' => $this->getUser()->getEmail(),
                'name' => $this->getUser()->getName(),
            ]));

            return $response;
        }
    }

    public function requestResetPassword(Request $request, MailerInterface $mailer)
    {
        $em = $this->getDoctrine()->getManager();

        $data = json_decode($request->getContent(), true);

        $resetPasswordToken = base64_encode(\random_bytes(30));

        $email = $data['email'];
        $user = $em->getRepository(User::class)->findOneByEmail($email);

        $date = new \DateTime();
        $date->add(new \DateInterval('PT1H'));

        if ($user && $user->getEnabled()) {
            $user->setResetPasswordToken($resetPasswordToken);
            $em->flush();

            $token = base64_encode(json_encode([
                'timestamp' => $date->getTimestamp(),
                'resetPasswordToken' => $resetPasswordToken
            ]));

            $email = (new TemplatedEmail())
                ->from('no-reply@dopp.bzh')
                ->to($email)
                ->subject('Réinitialisation de votre mot de passe')
                ->context([
                    'token' => $token,
                ])
                ->htmlTemplate('emails/reset-password.html.twig');

            $mailer->send($email);
        }

        return new JsonResponse("Email envoyé", 200);
    }

    public function verifyResetPassword(string $token)
    {
        $em = $this->getDoctrine()->getManager();

        $jsonToken = json_decode(base64_decode($token));

        $timestampToken = $jsonToken->timestamp;
        $resetPasswordToken = $jsonToken->resetPasswordToken;

        $dateNow = new \DateTime();
        $dateToken = new \DateTime();
        $dateToken->setTimestamp($timestampToken);

        $user = $em->getRepository(User::class)->findOneByresetPasswordToken($resetPasswordToken);

        if (null === $user || !$user->getEnabled() || $dateToken < $dateNow) {
            throw new NotFoundHttpException('');
        }

        $url = $this->generateUrl('home',
            array(),
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        return new RedirectResponse($url . "modification-mot-de-passe?token=".$token);
    }

    public function resetPassword(Request $request, UserPasswordEncoderInterface $encoder)
    {
        $em = $this->getDoctrine()->getManager();

        $data = json_decode($request->getContent(), true);

        $token = $data['token'];
        $password = $data['password'];

        $jsonToken = json_decode(base64_decode($token));

        $timestampToken = $jsonToken->timestamp;
        $resetPasswordToken = $jsonToken->resetPasswordToken;

        $dateNow = new \DateTime();
        $dateToken = new \DateTime();
        $dateToken->setTimestamp($timestampToken);

        $user = $em->getRepository(User::class)->findOneByresetPasswordToken($resetPasswordToken);

        if (null === $user || !$user->getEnabled() || $dateToken < $dateNow) {
            throw new NotFoundHttpException('');
        }

        try {
            $user->setPassword($encoder->encodePassword($user, $password));
            $user->setResetPasswordToken(null);
            $em->flush();
            return new JsonResponse('Mot de passe modifié', 200);
        }
        catch (\Exception $exception) {
            return new JsonResponse('Erreur', 400);
        }
    }
}